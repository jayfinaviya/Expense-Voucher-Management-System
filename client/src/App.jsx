import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { dashboardApi } from './api/dashboardApi';
import { voucherApi } from './api/voucherApi';
import { LoginPage } from './pages/LoginPage';
import { EmployeePortal } from './portals/EmployeePortal';
import { DirectorPortal } from './portals/DirectorPortal';
import { AccountsPortal } from './portals/AccountsPortal';
import { VoucherFormModal } from './components/vouchers/VoucherFormModal';
import { VoucherDetailsModal } from './components/vouchers/VoucherDetailsModal';
import { DirectorActionModal } from './components/vouchers/DirectorActionModal';
import { VoucherPrintSlip } from './components/vouchers/VoucherPrintSlip';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AccessDeniedPage } from './components/common/AccessDeniedPage';
import { Toast } from './components/common/Toast';
import confetti from 'canvas-confetti';

export function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Dashboard metrics state
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [directorModalOpen, setDirectorModalOpen] = useState(false);
  const [reviewingVoucher, setReviewingVoucher] = useState(null);

  const [printSlipOpen, setPrintSlipOpen] = useState(false);
  const [printingVoucher, setPrintingVoucher] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Intercept access denied redirects and notify user
  useEffect(() => {
    if (location.state?.accessDenied) {
      showToast(
        'error',
        location.state.deniedMessage || 'Access Denied: You do not have permission to access management areas.'
      );
      // Clean up browser history state to prevent re-firing toast on normal re-renders
      try {
        window.history.replaceState({}, document.title);
      } catch {
        // ignore
      }
    }
  }, [location.state]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }
  };

  // Fetch role-tailored dashboard metrics
  const fetchDashboardStats = async () => {
    if (!isAuthenticated) return;
    setDashboardLoading(true);
    try {
      const res = await dashboardApi.getStats();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [user, isAuthenticated]);

  // Handle revising a rejected voucher into a fresh prefilled draft
  const handleReviseDraft = (rejectedVoucher) => {
    setEditingVoucher({
      expense_date: new Date().toISOString().split('T')[0],
      department: rejectedVoucher.department,
      expense_title: `${rejectedVoucher.expense_title} (Revised)`,
      expense_category: rejectedVoucher.expense_category,
      expense_description: rejectedVoucher.expense_description 
        ? `[Revision for ${rejectedVoucher.voucher_number}]: ${rejectedVoucher.expense_description}` 
        : '',
      amount: rejectedVoucher.amount,
      employee_id: rejectedVoucher.employee_id,
      signature: rejectedVoucher.employee_signature || user?.default_signature || '',
      isRevision: true
    });
    setFormModalOpen(true);
    showToast('info', `Claim prefilled from ${rejectedVoucher.voucher_number}. Please adjust remarks and submit.`);
  };

  // Form Submission (Create or Edit Voucher)
  const handleVoucherFormSubmit = async (formData) => {
    try {
      if (editingVoucher && !editingVoucher.isRevision && editingVoucher.id) {
        const res = await voucherApi.updateVoucher(editingVoucher.id, formData);
        showToast('success', res.message || 'Voucher updated successfully');
      } else {
        const res = await voucherApi.createVoucher(formData);
        showToast('success', res.message || 'Voucher created successfully');
        if (formData.action === 'submit') {
          triggerConfetti();
        }
      }
      fetchDashboardStats();
    } catch (err) {
      throw err;
    }
  };

  // Director Approval Action
  const handleDirectorApprove = async (voucherId, signature) => {
    try {
      const res = await voucherApi.approveVoucher(voucherId, signature);
      showToast('success', res.message || 'Voucher approved successfully!');
      triggerConfetti();
      fetchDashboardStats();
    } catch (err) {
      showToast('error', err.message || 'Approval failed');
      throw err;
    }
  };

  // Director Rejection Action
  const handleDirectorReject = async (voucherId, rejectionReason) => {
    try {
      const res = await voucherApi.rejectVoucher(voucherId, rejectionReason);
      showToast('info', res.message || 'Voucher returned with feedback');
      fetchDashboardStats();
    } catch (err) {
      showToast('error', err.message || 'Rejection failed');
      throw err;
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        color: '#64748b',
        fontSize: '1rem',
        fontWeight: 500
      }}>
        Initializing Prachay Securities Expense Management System...
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : user?.role === 'employee' ? (
              <Navigate to="/employee" replace />
            ) : user?.role === 'director' ? (
              <Navigate to="/management" replace />
            ) : (
              <Navigate to="/accounts" replace />
            )
          }
        />

        {/* Employee Portal Route (Protected: Employee Only) */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRoles={['employee']} showToast={showToast}>
              <EmployeePortal
                dashboardData={dashboardData}
                onOpenCreate={() => { setEditingVoucher(null); setFormModalOpen(true); }}
                onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
                onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
                onEditDraft={(v) => { setEditingVoucher(v); setFormModalOpen(true); }}
                onReviseDraft={handleReviseDraft}
                showToast={showToast}
              />
            </ProtectedRoute>
          }
        />

        {/* Executive Management Portal Route (Protected: Director Only) */}
        <Route
          path="/management/*"
          element={
            <ProtectedRoute allowedRoles={['director']} showToast={showToast}>
              <DirectorPortal
                dashboardData={dashboardData}
                onReviewDirector={(v) => { setReviewingVoucher(v); setDirectorModalOpen(true); }}
                onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
                onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
                showToast={showToast}
              />
            </ProtectedRoute>
          }
        />

        {/* Admin and Director aliases redirect safely to /management */}
        <Route path="/admin/*" element={<Navigate to="/management" replace />} />
        <Route path="/director/*" element={<Navigate to="/management" replace />} />

        {/* Accounts Portal Route (Protected: Accounts Only, Read-Only) */}
        <Route
          path="/accounts/*"
          element={
            <ProtectedRoute allowedRoles={['accounts']} showToast={showToast}>
              <AccountsPortal
                dashboardData={dashboardData}
                onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
                onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
                showToast={showToast}
              />
            </ProtectedRoute>
          }
        />

        {/* Access Denied Page */}
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Root Route Redirect based on authenticated role */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : user?.role === 'employee' ? (
              <Navigate to="/employee" replace />
            ) : user?.role === 'director' ? (
              <Navigate to="/management" replace />
            ) : (
              <Navigate to="/accounts" replace />
            )
          }
        />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Shared Modals */}
      <VoucherFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleVoucherFormSubmit}
        editingVoucher={editingVoucher}
      />

      <VoucherDetailsModal
        isOpen={detailsModalOpen}
        voucher={selectedVoucher}
        onClose={() => setDetailsModalOpen(false)}
        onPrintSlip={(v) => { setDetailsModalOpen(false); setPrintingVoucher(v); setPrintSlipOpen(true); }}
        onReviseDraft={user?.role === 'employee' ? handleReviseDraft : null}
      />

      <DirectorActionModal
        isOpen={directorModalOpen}
        voucher={reviewingVoucher}
        onClose={() => setDirectorModalOpen(false)}
        onApprove={handleDirectorApprove}
        onReject={handleDirectorReject}
      />

      <VoucherPrintSlip
        isOpen={printSlipOpen}
        voucher={printingVoucher}
        onClose={() => setPrintSlipOpen(false)}
      />

      {/* Global Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
