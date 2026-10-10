import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { X, Printer, Calendar, User, Building, Tag, DollarSign, Clock, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

export const VoucherDetailsModal = ({ isOpen, voucher, onClose, onPrintSlip }) => {
  if (!isOpen || !voucher) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDateTime = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="mono-num" style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: '#1d4ed8',
              background: '#eff6ff',
              padding: '4px 10px',
              borderRadius: 6
            }}>
              {voucher.voucher_number}
            </span>
            <StatusBadge status={voucher.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Rejection Alert Banner */}
          {voucher.status === 'Rejected' && voucher.rejection_reason && (
            <div style={{
              display: 'flex',
              gap: 12,
              padding: 16,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              marginBottom: 20
            }}>
              <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem' }}>
                  Voucher Rejected by Director ({voucher.director_name || 'Executive'})
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#7f1d1d', marginTop: 4 }}>
                  {voucher.rejection_reason}
                </div>
              </div>
            </div>
          )}

          {/* Section: Basic Information */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 12 }}>
              1. Basic Expense Information
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              background: '#f8fafc',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Voucher Date</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{voucher.voucher_date}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Expense Date</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{voucher.expense_date}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Department</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{voucher.department}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Category</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{voucher.expense_category}</span>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Expense Title</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                {voucher.expense_title}
              </div>
            </div>

            {voucher.expense_description && (
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Expense Description & Notes</span>
                <div style={{ fontSize: '0.875rem', color: '#334155', background: '#f8fafc', padding: 12, borderRadius: 6, marginTop: 4 }}>
                  {voucher.expense_description}
                </div>
              </div>
            )}

            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <span style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.9375rem' }}>Total Claimed Amount</span>
              <span className="mono-num" style={{ fontWeight: 800, fontSize: '1.375rem', color: '#1d4ed8' }}>
                {formatCurrency(voucher.amount)}
              </span>
            </div>
          </div>

          {/* Section: Dual Signatures and Verification */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 12 }}>
              2. Authorization & Signature Trail
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {/* Employee Signature Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: 16,
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Prepared & Submitted By
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Employee</span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{voucher.employee_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 12 }}>
                  {voucher.employee_id || 'ID: EMP-N/A'} • {voucher.department}
                </div>

                <div style={{
                  height: 90,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 6,
                  padding: 8
                }}>
                  {voucher.employee_signature ? (
                    <img
                      src={voucher.employee_signature}
                      alt="Employee Signature"
                      style={{ maxHeight: 74, maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Signature Pending</span>
                  )}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                  {voucher.employee_signature_date ? `Signed on: ${formatDateTime(voucher.employee_signature_date)}` : 'Draft Status'}
                </div>
              </div>

              {/* Director Signature Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: 16,
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Director Approval Sign-off
                  </span>
                  <span style={{ fontSize: '0.75rem', color: voucher.status === 'Approved' ? '#059669' : '#dc2626', fontWeight: 600 }}>
                    Executive Gate
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {voucher.director_name || (voucher.status === 'Pending Approval' ? 'Awaiting Director Review' : 'N/A')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 12 }}>
                  Managing Director • Executive Management
                </div>

                <div style={{
                  height: 90,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 6,
                  padding: 8
                }}>
                  {voucher.director_signature ? (
                    <img
                      src={voucher.director_signature}
                      alt="Director Signature"
                      style={{ maxHeight: 74, maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : voucher.status === 'Pending Approval' ? (
                    <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>
                      Pending Executive Signature
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Director Signature</span>
                  )}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                  {voucher.approval_date ? `Approved on: ${formatDateTime(voucher.approval_date)}` : 'Approval Pending'}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Audit Information */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
            <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: 8 }}>
              3. Audit Trail
            </h4>
            <div style={{ display: 'flex', gap: 24, fontSize: '0.75rem', color: '#64748b' }}>
              <div>Record Created: {formatDateTime(voucher.created_at)}</div>
              <div>Last System Update: {formatDateTime(voucher.updated_at)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onPrintSlip(voucher)}
          >
            <Printer size={15} />
            Print Official Voucher Slip
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
