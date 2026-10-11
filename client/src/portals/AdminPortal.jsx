import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DirectorDashboard } from '../components/dashboards/DirectorDashboard';
import { AccountsDashboard } from '../components/dashboards/AccountsDashboard';
import { VouchersPage } from '../pages/VouchersPage';
import { LayoutDashboard, CheckSquare, Layers, DollarSign, ShieldCheck, Briefcase, LogOut, User, ArrowLeft, Download } from 'lucide-react';

export const AdminPortal = ({
  dashboardData,
  onReviewDirector,
  onViewDetails,
  onPrintSlip,
  showToast
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'pending', 'all_vouchers', 'reimbursements'

  const isDirector = user?.role === 'director';
  const isAccounts = user?.role === 'accounts';

  const pendingApprovalsCount = dashboardData?.stats?.pendingApprovalCount || 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Portal Identification & Switcher Bar */}
      <div style={{
        background: '#091e42',
        color: '#f8fafc',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        borderBottom: '1px solid #1e3a8a',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: isDirector ? '#7c3aed' : '#059669',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Admin Side
          </span>
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
            MANAGEMENT & ACCOUNTS PORTAL
          </span>
          <span style={{ color: '#64748b' }}>|</span>
          <span style={{ color: '#93c5fd' }}>
            {isDirector ? 'Director Executive Authorization' : 'Accounts Reimbursement & Audit'}
          </span>
        </div>

        {/* Security & Role Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: '#c4b5fd',
            fontSize: '0.6875rem'
          }}>
            <ShieldCheck size={12} style={{ color: '#a78bfa' }} />
            Role: <strong style={{ color: '#ffffff', textTransform: 'uppercase' }}>{user?.role}</strong>
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#cbd5e1', fontSize: '0.6875rem' }}>
            ID: <strong style={{ color: '#ffffff' }}>{user?.employee_id || user?.id}</strong>
          </span>
        </div>
      </div>

      {/* Admin Portal Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: isDirector 
              ? 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' 
              : 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)'
          }}>
            {isDirector ? 'D' : 'A'}
          </div>
          <div>
            <div style={{
              fontSize: '1.0625rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#0f172a',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              PRACHAY SECURITIES
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                background: isDirector ? '#ede9fe' : '#d1fae5',
                color: isDirector ? '#5b21b6' : '#065f46',
                padding: '2px 8px',
                borderRadius: 4,
                border: isDirector ? '1px solid #ddd6fe' : '1px solid #a7f3d0'
              }}>
                {isDirector ? 'EXECUTIVE MANAGEMENT' : 'FINANCE & ACCOUNTS'}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Corporate Expense Governance & Reimbursement Clearance
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: isDirector ? '#ede9fe' : '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: isDirector ? '#6d28d9' : '#047857'
            }}>
              {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {isDirector ? 'Managing Director' : 'Chief Accounts Officer'} • {user?.department}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ color: '#64748b' }}
            title="Sign Out"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 28px',
        display: 'flex',
        gap: 8
      }}>
        {[
          { id: 'overview', label: 'Management Dashboard', icon: <LayoutDashboard size={15} /> },
          {
            id: 'pending',
            label: 'Pending Approvals Queue',
            icon: <CheckSquare size={15} />,
            badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
            urgent: true
          },
          { id: 'all_vouchers', label: 'All Company Vouchers Ledger', icon: <Layers size={15} /> },
          { id: 'reimbursements', label: 'Approved Reimbursement Register', icon: <DollarSign size={15} /> }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? (isDirector ? '2px solid #7c3aed' : '2px solid #059669') : '2px solid transparent',
                color: isActive ? (isDirector ? '#6d28d9' : '#047857') : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 120ms ease'
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 9999,
                  background: '#dc2626',
                  color: '#ffffff'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Admin Content Workspace */}
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {activeTab === 'overview' && (
          <>
            {isDirector ? (
              <DirectorDashboard
                stats={dashboardData?.stats}
                pendingList={dashboardData?.pendingList}
                recentActivity={dashboardData?.recentActivity}
                onReviewVoucher={onReviewDirector}
                onViewDetails={onViewDetails}
                onViewAllPending={() => setActiveTab('pending')}
                onViewAll={() => setActiveTab('all_vouchers')}
              />
            ) : (
              <AccountsDashboard
                stats={dashboardData?.stats}
                recentApproved={dashboardData?.recentApprovedVouchers}
                onPrintSlip={onPrintSlip}
                onViewDetails={onViewDetails}
                onViewAll={() => setActiveTab('all_vouchers')}
              />
            )}
          </>
        )}

        {activeTab === 'pending' && (
          <VouchersPage
            initialStatus="Pending Approval"
            pageTitle="Pending Executive Sign-off Queue"
            pageSubtitle="Vouchers submitted by employees requiring executive review, verification, and digital signature"
            onOpenCreate={null}
            onViewDetails={onViewDetails}
            onPrintSlip={onPrintSlip}
            onEditDraft={null}
            onReviewDirector={isDirector ? onReviewDirector : null}
            showToast={showToast}
          />
        )}

        {activeTab === 'all_vouchers' && (
          <VouchersPage
            initialStatus="All"
            pageTitle="Organization Expense Vouchers Ledger"
            pageSubtitle="Centralized company repository across all departments with multi-criteria audit filtering"
            onOpenCreate={null}
            onViewDetails={onViewDetails}
            onPrintSlip={onPrintSlip}
            onEditDraft={null}
            onReviewDirector={isDirector ? onReviewDirector : null}
            showToast={showToast}
          />
        )}

        {activeTab === 'reimbursements' && (
          <VouchersPage
            initialStatus="Approved"
            pageTitle="Approved Reimbursements Register"
            pageSubtitle="Vouchers approved by Director with dual signatures, cleared for Accounts payment processing"
            onOpenCreate={null}
            onViewDetails={onViewDetails}
            onPrintSlip={onPrintSlip}
            onEditDraft={null}
            onReviewDirector={null}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
};
