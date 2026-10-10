import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { Briefcase, IndianRupee, Layers, CheckCircle2, Clock, XCircle, Printer, Eye, ArrowRight, Download } from 'lucide-react';

export const AccountsDashboard = ({
  stats,
  recentApproved = [],
  onPrintSlip,
  onViewDetails,
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
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
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
              color: '#a7f3d0'
            }}>
              Accounts & Finance Division
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#d1fae5' }}>
              Reimbursement Audit & Payment Processing
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: 8 }}>
            Finance Portal: {user?.name}
          </h2>
          <p style={{ color: '#d1fae5', fontSize: '0.875rem', maxWidth: 560, marginTop: 4 }}>
            Monitor organization-wide expense claims, audit approved vouchers containing dual signatures, and print/export formal voucher slips for banking disbursement.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '12px 20px',
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Approved for Payout
          </div>
          <div className="mono-num" style={{ fontSize: '1.375rem', fontWeight: 800, color: '#ffffff' }}>
            {formatCurrency(stats?.totalApprovedExpenseAmount)}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Total Approved Amount */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Approved Reimbursement</span>
            <span style={{ background: '#d1fae5', padding: 6, borderRadius: 6, color: '#059669' }}>
              <IndianRupee size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }}>
            {formatCurrency(stats?.totalApprovedExpenseAmount)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>Passed by Director</span>
        </div>

        {/* Total Vouchers */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Organization Vouchers</span>
            <span style={{ background: '#f1f5f9', padding: 6, borderRadius: 6, color: '#475569' }}>
              <Layers size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {stats?.totalVouchers || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>All claims across company</span>
        </div>

        {/* Pending Approval */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>In Approval Pipeline</span>
            <span style={{ background: '#fef3c7', padding: 6, borderRadius: 6, color: '#d97706' }}>
              <Clock size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>
            {stats?.pendingApproval || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Pending Director</span>
        </div>

        {/* Approved Vouchers */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Approved Count</span>
            <span style={{ background: '#d1fae5', padding: 6, borderRadius: 6, color: '#059669' }}>
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }}>
            {stats?.approvedVouchers || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>Ready for bank disbursement</span>
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
          <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Audited rejections</span>
        </div>
      </div>

      {/* Recent Approved Vouchers Section */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="#059669" />
              Recent Approved Vouchers (Disbursement Queue)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Vouchers sanctioned by Director with verified signatures, ready for payment processing
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onViewAll}
          >
            Audit All Organization Vouchers
            <ArrowRight size={14} />
          </button>
        </div>

        {recentApproved.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
            No approved vouchers yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Approval Date</th>
                  <th>Employee Beneficiary</th>
                  <th>Department</th>
                  <th>Expense Particulars</th>
                  <th style={{ textAlign: 'right' }}>Approved Amount</th>
                  <th style={{ textAlign: 'center' }}>Dual Signatures</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentApproved.map((v) => (
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
                    <td>{v.approval_date ? new Date(v.approval_date).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.employee_id}</div>
                    </td>
                    <td>{v.department}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.expense_title}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono-num" style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#047857' }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#047857',
                        background: '#d1fae5',
                        padding: '2px 8px',
                        borderRadius: 4
                      }}>
                        Employee + Director Verified
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onViewDetails(v)}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => onPrintSlip(v)}
                          title="Print Formal Voucher Slip"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        >
                          <Printer size={13} />
                          Print Slip
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
    </div>
  );
};
