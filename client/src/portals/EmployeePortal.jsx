import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EmployeeDashboard } from '../components/dashboards/EmployeeDashboard';
import { VouchersPage } from '../pages/VouchersPage';
import { LayoutDashboard, FileText, PlusCircle, AlertCircle, Edit3, UserCheck, LogOut, ArrowRight, Lock } from 'lucide-react';

export const EmployeePortal = ({
  dashboardData,
  onOpenCreate,
  onViewDetails,
  onPrintSlip,
  onEditDraft,
  onReviseDraft,
  showToast
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'claims', 'drafts', 'revisions'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Portal Identification Banner (Strict Employee Isolation) */}
      <div style={{
        background: '#0f172a',
        color: '#f8fafc',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        borderBottom: '1px solid #1e293b',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: '#2563eb',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.6875rem'
          }}>
            Employee Portal
          </span>
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
            PRACHAY SECURITIES
          </span>
          <span style={{ color: '#64748b' }}>|</span>
          <span style={{ color: '#94a3b8' }}>
            Personal Claim Submissions & Status Tracking
          </span>
        </div>

        {/* Security & Authenticated User Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: '#94a3b8',
            fontSize: '0.6875rem'
          }}>
            <Lock size={12} style={{ color: '#3b82f6' }} />
            Role: <strong style={{ color: '#60a5fa', textTransform: 'uppercase' }}>{user?.role || 'EMPLOYEE'}</strong>
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#cbd5e1', fontSize: '0.6875rem' }}>
            Account ID: <strong style={{ color: '#f8fafc' }}>{user?.employee_id || `EMP-${user?.id}`}</strong>
          </span>
        </div>
      </div>

      {/* Employee Portal Header */}
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
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)'
          }}>
            P
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
                background: '#eff6ff',
                color: '#1d4ed8',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid #bfdbfe'
              }}>
                EMPLOYEE WORKSPACE
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Employee Self-Service Expense Voucher System
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreate}
            style={{ padding: '8px 18px', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
          >
            <PlusCircle size={16} />
            Create Expense Claim
          </button>

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
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: '#1e40af'
            }}>
              {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {user?.department} • {user?.employee_id || 'ID: N/A'}
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

      {/* Sub-Navigation Tabs */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 28px',
        display: 'flex',
        gap: 8
      }}>
        {[
          { id: 'overview', label: 'My Dashboard Overview', icon: <LayoutDashboard size={15} /> },
          { id: 'claims', label: 'All My Expense Claims', icon: <FileText size={15} /> },
          { id: 'drafts', label: 'Drafts in Progress', icon: <Edit3 size={15} />, badge: dashboardData?.stats?.draftVouchers },
          { id: 'revisions', label: 'Returned / Needs Revision', icon: <AlertCircle size={15} />, badge: dashboardData?.stats?.rejectedVouchers }
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
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                color: isActive ? '#1d4ed8' : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 120ms ease'
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 9999,
                  background: tab.id === 'revisions' ? '#fee2e2' : '#f1f5f9',
                  color: tab.id === 'revisions' ? '#dc2626' : '#475569'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Employee Workspace Content */}
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {activeTab === 'overview' && (
          <EmployeeDashboard
            stats={dashboardData?.stats}
            recentVouchers={dashboardData?.recentVouchers}
            onCreateVoucher={onOpenCreate}
            onViewAll={() => setActiveTab('claims')}
            onViewDetails={onViewDetails}
            onEditDraft={onEditDraft}
            onReviseDraft={onReviseDraft}
            onViewRevisions={() => setActiveTab('revisions')}
          />
        )}

        {activeTab === 'claims' && (
          <VouchersPage
            initialStatus="All"
            pageTitle="My Expense Claims"
            pageSubtitle="View, filter, and track status of all vouchers submitted by you"
            onOpenCreate={onOpenCreate}
            onViewDetails={onViewDetails}
            onPrintSlip={onPrintSlip}
            onEditDraft={onEditDraft}
            onReviseDraft={onReviseDraft}
            onReviewDirector={null}
            showToast={showToast}
          />
        )}

        {activeTab === 'drafts' && (
          <VouchersPage
            initialStatus="Draft"
            pageTitle="Draft Expense Vouchers"
            pageSubtitle="Work-in-progress vouchers saved as drafts. You can edit, delete, or sign & submit them."
            onOpenCreate={onOpenCreate}
            onViewDetails={onViewDetails}
            onPrintSlip={onPrintSlip}
            onEditDraft={onEditDraft}
            onReviseDraft={onReviseDraft}
            onReviewDirector={null}
            showToast={showToast}
          />
        )}

        {activeTab === 'revisions' && (
          <VouchersPage
            initialStatus="Rejected"
            pageTitle="Returned Claims (Needs Revision)"
            pageSubtitle="Vouchers returned by the Director. Review the feedback remarks and re-submit as required."
            onOpenCreate={onOpenCreate}
            onViewDetails={onViewDetails}
            onPrintSlip={onPrintSlip}
            onEditDraft={onEditDraft}
            onReviseDraft={onReviseDraft}
            onReviewDirector={null}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
};
