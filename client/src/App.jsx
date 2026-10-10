import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { dashboardApi } from './api/dashboardApi';
import { voucherApi } from './api/voucherApi';
import { LoginPage } from './pages/LoginPage';
import { EmployeePortal } from './portals/EmployeePortal';
import { AdminPortal } from './portals/AdminPortal';
import { VoucherFormModal } from './components/vouchers/VoucherFormModal';
import { VoucherDetailsModal } from './components/vouchers/VoucherDetailsModal';
import { DirectorActionModal } from './components/vouchers/DirectorActionModal';
import { VoucherPrintSlip } from './components/vouchers/VoucherPrintSlip';
import { Toast } from './components/common/Toast';
import confetti from 'canvas-confetti';

export function App() {
  const { user, isAuthenticated, loading } = useAuth();

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
    }, 4500);
  };

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

  // Form Submission (Create or Edit Voucher)
  const handleVoucherFormSubmit = async (formData) => {
    try {
      if (editingVoucher) {
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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      {/* Explicit Portal Routing: User Side vs Admin Side */}
      {user.role === 'employee' ? (
        <EmployeePortal
          dashboardData={dashboardData}
          onOpenCreate={() => { setEditingVoucher(null); setFormModalOpen(true); }}
          onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
          onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
          onEditDraft={(v) => { setEditingVoucher(v); setFormModalOpen(true); }}
          showToast={showToast}
        />
      ) : (
        <AdminPortal
          dashboardData={dashboardData}
          onReviewDirector={(v) => { setReviewingVoucher(v); setDirectorModalOpen(true); }}
          onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
          onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
          showToast={showToast}
        />
      )}

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
