import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { dashboardApi } from './api/dashboardApi';
import { voucherApi } from './api/voucherApi';
import { LoginPage } from './pages/LoginPage';
import { VouchersPage } from './pages/VouchersPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { EmployeeDashboard } from './components/dashboards/EmployeeDashboard';
import { DirectorDashboard } from './components/dashboards/DirectorDashboard';
import { AccountsDashboard } from './components/dashboards/AccountsDashboard';
import { VoucherFormModal } from './components/vouchers/VoucherFormModal';
import { VoucherDetailsModal } from './components/vouchers/VoucherDetailsModal';
import { DirectorActionModal } from './components/vouchers/DirectorActionModal';
import { VoucherPrintSlip } from './components/vouchers/VoucherPrintSlip';
import { Toast } from './components/common/Toast';
import confetti from 'canvas-confetti';

export function App() {
  const { user, isAuthenticated, loading } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard data state
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

  // Trigger celebration confetti
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
      setActiveTab('dashboard');
    }
  }, [user, isAuthenticated]);

  // Form Submission (Create or Edit)
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

  // Director Approval action
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

  // Director Rejection action
  const handleDirectorReject = async (voucherId, rejectionReason) => {
    try {
      const res = await voucherApi.rejectVoucher(voucherId, rejectionReason);
      showToast('info', res.message || 'Voucher rejected');
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

  const pendingApprovalsCount = dashboardData?.stats?.pendingApprovalCount || 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Navigation Header */}
      <Navbar
        onOpenNewVoucher={user?.role === 'employee' ? () => { setEditingVoucher(null); setFormModalOpen(true); } : null}
      />

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto' }}>
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            if (tabId === 'create') {
              setEditingVoucher(null);
              setFormModalOpen(true);
            } else {
              setActiveTab(tabId);
            }
          }}
          pendingCount={pendingApprovalsCount}
        />

        {/* Dynamic Main Workspace Content */}
        <main style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>
          {activeTab === 'dashboard' && (
            <>
              {user.role === 'employee' && (
                <EmployeeDashboard
                  stats={dashboardData?.stats}
                  recentVouchers={dashboardData?.recentVouchers}
                  onCreateVoucher={() => { setEditingVoucher(null); setFormModalOpen(true); }}
                  onViewAll={() => setActiveTab('vouchers')}
                  onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
                  onEditDraft={(v) => { setEditingVoucher(v); setFormModalOpen(true); }}
                />
              )}

              {user.role === 'director' && (
                <DirectorDashboard
                  stats={dashboardData?.stats}
                  pendingList={dashboardData?.pendingList}
                  recentActivity={dashboardData?.recentActivity}
                  onReviewVoucher={(v) => { setReviewingVoucher(v); setDirectorModalOpen(true); }}
                  onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
                  onViewAllPending={() => setActiveTab('pending')}
                  onViewAll={() => setActiveTab('all_vouchers')}
                />
              )}

              {user.role === 'accounts' && (
                <AccountsDashboard
                  stats={dashboardData?.stats}
                  recentApproved={dashboardData?.recentApprovedVouchers}
                  onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
                  onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
                  onViewAll={() => setActiveTab('all_vouchers')}
                />
              )}
            </>
          )}

          {activeTab === 'vouchers' && (
            <VouchersPage
              initialStatus="All"
              pageTitle="My Expense Vouchers"
              pageSubtitle="All personal expense reimbursement claims filed by you"
              onOpenCreate={() => { setEditingVoucher(null); setFormModalOpen(true); }}
              onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
              onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
              onEditDraft={(v) => { setEditingVoucher(v); setFormModalOpen(true); }}
              onReviewDirector={(v) => { setReviewingVoucher(v); setDirectorModalOpen(true); }}
              showToast={showToast}
            />
          )}

          {activeTab === 'pending' && (
            <VouchersPage
              initialStatus="Pending Approval"
              pageTitle="Pending Executive Approvals"
              pageSubtitle="Expense vouchers submitted by employees awaiting Director sanction and signature"
              onOpenCreate={null}
              onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
              onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
              onEditDraft={(v) => { setEditingVoucher(v); setFormModalOpen(true); }}
              onReviewDirector={(v) => { setReviewingVoucher(v); setDirectorModalOpen(true); }}
              showToast={showToast}
            />
          )}

          {activeTab === 'all_vouchers' && (
            <VouchersPage
              initialStatus="All"
              pageTitle="Organization Expense Vouchers"
              pageSubtitle="Complete company-wide expense voucher repository and audit ledger"
              onOpenCreate={null}
              onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
              onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
              onEditDraft={(v) => { setEditingVoucher(v); setFormModalOpen(true); }}
              onReviewDirector={(v) => { setReviewingVoucher(v); setDirectorModalOpen(true); }}
              showToast={showToast}
            />
          )}

          {activeTab === 'reimbursements' && (
            <VouchersPage
              initialStatus="Approved"
              pageTitle="Approved Reimbursements Register"
              pageSubtitle="Vouchers approved with verified Director signatures, cleared for payment execution"
              onOpenCreate={null}
              onViewDetails={(v) => { setSelectedVoucher(v); setDetailsModalOpen(true); }}
              onPrintSlip={(v) => { setPrintingVoucher(v); setPrintSlipOpen(true); }}
              onEditDraft={null}
              onReviewDirector={null}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Modals */}
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
    </div>
  );
}
