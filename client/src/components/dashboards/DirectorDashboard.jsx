import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, Clock, CheckCircle2, XCircle, IndianRupee, ArrowRight, Eye, CheckSquare } from 'lucide-react';

export const DirectorDashboard = ({
  stats,
  pendingList = [],
  recentActivity = [],
  onReviewVoucher,
  onViewDetails,
  onViewAllPending,
  onViewAll
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
      {/* Header Banner */}
      <div className="card" style={{
        padding: '24px 28px',
        marginBottom: 24,
        background: 'linear-gradient(135deg, #091e42 0%, #0f2b5c 100%)',
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
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '3px 10px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#93c5fd'
            }}>
              Executive Control Portal
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
              Managing Director • Organization-Wide Authority
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: 8 }}>
            Executive Dashboard: {user?.name}
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.875rem', maxWidth: 560, marginTop: 4 }}>
            Review pending employee expense submissions. Executive approval signs off on financial reimbursement with verifiable cryptographic signatures.
          </p>
        </div>

        {stats?.pendingApprovalCount > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '12px 20px',
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 600, textTransform: 'uppercase' }}>
              Action Required
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fecaca' }}>
              {stats?.pendingApprovalCount} Pending Sign-offs
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Pending Approval Count */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending Approval</span>
            <span style={{ background: '#fef3c7', padding: 6, borderRadius: 6, color: '#d97706' }}>
              <Clock size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.625rem', fontWeight: 800, color: '#b45309' }}>
            {stats?.pendingApprovalCount || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Awaiting executive decision</span>
        </div>

        {/* Total Pending Amount */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Pending Amount</span>
            <span style={{ background: '#eff6ff', padding: 6, borderRadius: 6, color: '#2563eb' }}>
              <IndianRupee size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1d4ed8' }}>
            {formatCurrency(stats?.totalPendingAmount)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cumulative pending liability</span>
        </div>

        {/* Approved Today */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Approved Today</span>
            <span style={{ background: '#d1fae5', padding: 6, borderRadius: 6, color: '#059669' }}>
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.625rem', fontWeight: 800, color: '#047857' }}>
            {stats?.approvedToday || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>Sanctioned on current date</span>
        </div>

        {/* Rejected Today */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Rejected Today</span>
            <span style={{ background: '#fee2e2', padding: 6, borderRadius: 6, color: '#dc2626' }}>
              <XCircle size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.625rem', fontWeight: 800, color: '#b91c1c' }}>
            {stats?.rejectedToday || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Returned with feedback</span>
        </div>
      </div>

      {/* Urgent Pending Review Section */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 24, border: '1px solid #fde68a' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#d97706" />
              Pending Approval Queue
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Directly review, inspect employee signature, and attach Director approval signature
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onViewAllPending}
          >
            Filter Pending Only
            <ArrowRight size={14} />
          </button>
        </div>

        {pendingList.length === 0 ? (
          <div style={{
            padding: 32,
            textAlign: 'center',
            background: '#fffbeb',
            borderRadius: 8,
            color: '#92400e',
            fontSize: '0.875rem'
          }}>
            <CheckCircle2 size={24} color="#059669" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            All caught up! No vouchers currently awaiting Director approval.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Submitted Date</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Expense Particulars</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((v) => (
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
                    <td>{v.voucher_date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.employee_id}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{v.department}</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.expense_category}</div>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.expense_title}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono-num" style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onViewDetails(v)}
                        >
                          <Eye size={13} />
                          Details
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => onReviewVoucher(v)}
                          style={{ background: '#059669', borderColor: '#059669' }}
                        >
                          <CheckSquare size={13} />
                          Review & Decide
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Organization Wide Recent Activity */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', color: '#0f172a' }}>Organization Voucher Ledger</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Full audit visibility across all departments and employees
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onViewAll}
          >
            View All Company Vouchers
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Expense Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Title</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span className="mono-num" style={{ fontWeight: 700, color: '#1d4ed8' }}>
                      {v.voucher_number}
                    </span>
                  </td>
                  <td>{v.expense_date}</td>
                  <td>{v.employee_name}</td>
                  <td>{v.department}</td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.expense_title}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="mono-num" style={{ fontWeight: 700 }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v.amount)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewDetails(v)}
                    >
                      <Eye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
