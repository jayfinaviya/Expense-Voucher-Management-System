import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DirectorDashboard } from '../components/dashboards/DirectorDashboard';
import { VouchersPage } from '../pages/VouchersPage';
import { LayoutDashboard, CheckSquare, Layers, DollarSign, LogOut, User, Shield, Lock } from 'lucide-react';

export const DirectorPortal = ({
  dashboardData,
  onReviewDirector,
  onViewDetails,
  onPrintSlip,
  showToast
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'pending', 'all_vouchers', 'reimbursements'

  const pendingApprovalsCount = dashboardData?.stats?.pendingApprovalCount || 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Portal Identification Bar (Director Authorized Workspace) */}
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
            background: '#7c3aed',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.6875rem'
          }}>
            Director Gate
          </span>
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
            EXECUTIVE MANAGEMENT PORTAL
          </span>
          <span style={{ color: '#64748b' }}>|</span>
          <span style={{ color: '#93c5fd' }}>
            Corporate Expense Authorization & Digital Sign-off
          </span>
        </div>

        {/* Security & Authenticated Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: '#c4b5fd',
            fontSize: '0.6875rem'
          }}>
            <Shield size={12} style={{ color: '#a78bfa' }} />
            Role: <strong style={{ color: '#ffffff', textTransform: 'uppercase' }}>{user?.role || 'DIRECTOR'}</strong>
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#cbd5e1', fontSize: '0.6875rem' }}>
            Director ID: <strong style={{ color: '#ffffff' }}>{user?.employee_id || `DIR-${user?.id}`}</strong>
          </span>
        </div>
      </div>

      {/* Director Portal Header */}
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
            background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)'
          }}>
            D
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
                background: '#ede9fe',
                color: '#5b21b6',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid #ddd6fe'
              }}>
                EXECUTIVE MANAGEMENT
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Corporate Expense Governance & Executive Authorization
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
              background: '#ede9fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: '#6d28d9'
            }}>
              {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Managing Director • {user?.department}
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

      {/* Director Navigation Tabs (Section 11 Suggested Screens) */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 28px',
        display: 'flex',
        gap: 8
      }}>
        {[
          { id: 'overview', label: 'Director Dashboard', icon: <LayoutDashboard size={15} /> },
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
                borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                color: isActive ? '#6d28d9' : '#64748b',
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

      {/* Main Director Content Workspace */}
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {activeTab === 'overview' && (
          <DirectorDashboard
            stats={dashboardData?.stats}
            pendingList={dashboardData?.pendingList}
            recentActivity={dashboardData?.recentActivity}
            onReviewVoucher={onReviewDirector}
            onViewDetails={onViewDetails}
            onViewAllPending={() => setActiveTab('pending')}
            onViewAll={() => setActiveTab('all_vouchers')}
          />
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
            onReviewDirector={onReviewDirector}
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
            onReviewDirector={onReviewDirector}
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
