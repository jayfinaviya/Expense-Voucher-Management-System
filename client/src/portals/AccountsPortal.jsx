import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AccountsDashboard } from '../components/dashboards/AccountsDashboard';
import { VouchersPage } from '../pages/VouchersPage';
import { LayoutDashboard, Layers, DollarSign, LogOut, User, Shield, Briefcase, Eye } from 'lucide-react';

export const AccountsPortal = ({
  dashboardData,
  onViewDetails,
  onPrintSlip,
  showToast
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'ledger', 'reimbursements'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Portal Identification Bar (Accounts Read-Only Workspace) */}
      <div style={{
        background: '#064e3b',
        color: '#f8fafc',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        borderBottom: '1px solid #047857',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: '#059669',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.6875rem'
          }}>
            Accounts Team
          </span>
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
            FINANCE & REIMBURSEMENT PORTAL
          </span>
          <span style={{ color: '#6ee7b7' }}>|</span>
          <span style={{ color: '#a7f3d0' }}>
            Corporate Audit, Payment Processing & Disbursement (Read-Only)
          </span>
        </div>

        {/* Security & Authenticated Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: '#a7f3d0',
            fontSize: '0.6875rem'
          }}>
            <Eye size={12} style={{ color: '#34d399' }} />
            Role: <strong style={{ color: '#ffffff', textTransform: 'uppercase' }}>{user?.role || 'ACCOUNTS'} (READ-ONLY)</strong>
          </span>
          <span style={{ color: '#047857' }}>•</span>
          <span style={{ color: '#d1fae5', fontSize: '0.6875rem' }}>
            Staff ID: <strong style={{ color: '#ffffff' }}>{user?.employee_id || `ACC-${user?.id}`}</strong>
          </span>
        </div>
      </div>

      {/* Accounts Portal Header */}
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
            background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)'
          }}>
            A
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
                background: '#d1fae5',
                color: '#065f46',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid #a7f3d0'
              }}>
                FINANCE & ACCOUNTS
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
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: '#047857'
            }}>
              {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Chief Accounts Officer • {user?.department}
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

      {/* Accounts Navigation Tabs (Section 11 Suggested Screens) */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 28px',
        display: 'flex',
        gap: 8
      }}>
        {[
          { id: 'overview', label: 'Accounts Dashboard', icon: <LayoutDashboard size={15} /> },
          { id: 'ledger', label: 'All Company Vouchers Ledger', icon: <Layers size={15} /> },
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
                borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                color: isActive ? '#047857' : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 120ms ease'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Accounts Content Workspace */}
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {activeTab === 'overview' && (
          <AccountsDashboard
            stats={dashboardData?.stats}
            recentApproved={dashboardData?.recentApprovedVouchers}
            onPrintSlip={onPrintSlip}
            onViewDetails={onViewDetails}
            onViewAll={() => setActiveTab('ledger')}
          />
        )}

        {activeTab === 'ledger' && (
          <VouchersPage
            initialStatus="All"
            pageTitle="Organization Expense Vouchers Ledger"
            pageSubtitle="Centralized company repository across all departments with multi-criteria audit filtering and CSV export"
            onOpenCreate={null}
            onViewDetails={onViewDetails}
            onPrintSlip={onPrintSlip}
            onEditDraft={null}
            onReviewDirector={null}
            showToast={showToast}
          />
        )}

        {activeTab === 'reimbursements' && (
          <VouchersPage
            initialStatus="Approved"
            pageTitle="Approved Reimbursements Register"
            pageSubtitle="Vouchers approved by Director with dual signatures, cleared for Accounts payment disbursement"
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
