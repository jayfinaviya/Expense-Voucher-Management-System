import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { PlusCircle, FileText, Clock, CheckCircle2, XCircle, IndianRupee, ArrowRight, Eye, Edit2 } from 'lucide-react';

export const EmployeeDashboard = ({
  stats,
  recentVouchers = [],
  onCreateVoucher,
  onViewAll,
  onViewDetails,
  onEditDraft,
  onReviseDraft,
  onViewRevisions
}) => {
  const { user } = useAuth();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div>
      {/* Returned / Rejected Claims Attention Banner */}
      {stats?.rejectedVouchers > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '14px 20px',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ background: '#fee2e2', padding: 8, borderRadius: '50%', color: '#dc2626' }}>
              <XCircle size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.9375rem' }}>
                Action Required: {stats.rejectedVouchers} Claim(s) Returned by Director
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#7f1d1d' }}>
                The Director has provided revision remarks. Review feedback and resubmit as revised claims.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={onViewRevisions}
          >
            Review Returned Claims
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="card" style={{
        padding: '24px 28px',
        marginBottom: 24,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '3px 10px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Employee Workspace
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              {user?.department} • ID: {user?.employee_id || 'N/A'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: 8 }}>
            Welcome back, {user?.name}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: 500, marginTop: 4 }}>
            Create and track your expense reimbursement claims. Submitted vouchers route directly to Director for digital authorization.
          </p>
        </div>

        <div>
          <button
            className="btn btn-primary btn-lg"
            onClick={onCreateVoucher}
            style={{
              background: '#2563eb',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              padding: '12px 20px'
            }}
          >
            <PlusCircle size={18} />
            Create Expense Voucher
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Total Amount Claimed */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Claimed</span>
            <span style={{ background: '#eff6ff', padding: 6, borderRadius: 6, color: '#2563eb' }}>
              <IndianRupee size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {formatCurrency(stats?.totalAmountClaimed)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all submissions</span>
        </div>

        {/* Total Vouchers */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Vouchers</span>
            <span style={{ background: '#f1f5f9', padding: 6, borderRadius: 6, color: '#475569' }}>
              <FileText size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {stats?.totalVouchers || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total claims logged</span>
        </div>

        {/* Draft Vouchers */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Drafts</span>
            <span style={{ background: '#f1f5f9', padding: 6, borderRadius: 6, color: '#64748b' }}>
              <Edit2 size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#475569' }}>
            {stats?.draftVouchers || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Editable before submission</span>
        </div>

        {/* Pending Approval */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending Approval</span>
            <span style={{ background: '#fef3c7', padding: 6, borderRadius: 6, color: '#d97706' }}>
              <Clock size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>
            {stats?.pendingApproval || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Under Director review</span>
        </div>

        {/* Approved Vouchers */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Approved</span>
            <span style={{ background: '#d1fae5', padding: 6, borderRadius: 6, color: '#059669' }}>
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }}>
            {stats?.approvedVouchers || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>Passed for reimbursement</span>
        </div>

        {/* Rejected Vouchers */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Rejected</span>
            <span style={{ background: '#fee2e2', padding: 6, borderRadius: 6, color: '#dc2626' }}>
              <XCircle size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c' }}>
            {stats?.rejectedVouchers || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Requires revision</span>
        </div>
      </div>

      {/* Recent Personal Vouchers Table */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', color: '#0f172a' }}>Recent Voucher Activity</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Your latest submitted and draft expense vouchers
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onViewAll}
          >
            View All My Vouchers
            <ArrowRight size={14} />
          </button>
        </div>

        {recentVouchers.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            No vouchers created yet. Click "Create Expense Voucher" above to begin.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Expense Date</th>
                  <th>Expense Title</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentVouchers.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span className="mono-num" style={{
                        fontWeight: 700,
                        color: '#1d4ed8',
                        background: '#eff6ff',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.8125rem'
                      }}>
                        {v.voucher_number}
                      </span>
                    </td>
                    <td>{v.expense_date}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{v.expense_title}</td>
                    <td style={{ color: '#64748b' }}>{v.expense_category}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono-num" style={{ fontWeight: 700 }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v.amount)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onViewDetails(v)}
                        >
                          <Eye size={13} />
                          View
                        </button>
                        {v.status === 'Draft' && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onEditDraft(v)}
                            title="Edit Draft"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {v.status === 'Rejected' && onReviseDraft && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => onReviseDraft(v)}
                            title="Revise Claim"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Revise
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
