import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SignaturePad } from '../common/SignaturePad';
import { CheckCircle2, XCircle, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DirectorActionModal = ({ isOpen, voucher, onClose, onApprove, onReject }) => {
  const { user } = useAuth();
  const [actionTab, setActionTab] = useState('approve'); // 'approve' or 'reject'
  const [directorSignature, setDirectorSignature] = useState(user?.default_signature || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !voucher) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const handleConfirmApproval = async () => {
    // Validation rule: Director Signature is mandatory before approval
    if (!directorSignature) {
      setError('Director signature is mandatory before approving this expense voucher.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onApprove(voucher.id, directorSignature);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRejection = async () => {
    // Validation rule: Rejection Reason is mandatory if a voucher is rejected
    if (!rejectionReason || !rejectionReason.trim()) {
      setError('A detailed rejection reason is mandatory when rejecting a voucher.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onReject(voucher.id, rejectionReason.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reject voucher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} color="#059669" />
              Director Voucher Review: {voucher.voucher_number}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 2 }}>
              Executive approval gate for corporate reimbursement. Director signature or rejection reason required.
            </p>
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
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: 6,
              marginBottom: 16,
              fontSize: '0.875rem'
            }}>
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {/* Voucher Summary Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Employee</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{voucher.employee_name}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>{voucher.employee_id || 'ID: N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Department</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{voucher.department}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Expense Category</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{voucher.expense_category}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Total Amount</span>
                <span className="mono-num" style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1d4ed8' }}>
                  {formatCurrency(voucher.amount)}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Expense Title</span>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{voucher.expense_title}</div>
              {voucher.expense_description && (
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: 4 }}>
                  {voucher.expense_description}
                </div>
              )}
            </div>

            {/* Employee Signature Preview */}
            {voucher.employee_signature && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, marginTop: 10 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', marginBottom: 6 }}>
                  Employee Verified Signature
                </span>
                <div style={{
                  display: 'inline-block',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '6px 14px'
                }}>
                  <img
                    src={voucher.employee_signature}
                    alt="Employee Signature"
                    style={{ height: 42, maxWidth: 200, objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', textAlign: 'center' }}>
                    Signed by {voucher.employee_name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Choice Tabs: Approve vs Reject */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              className={`btn ${actionTab === 'approve' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => { setActionTab('approve'); setError(''); }}
              style={{ flex: 1, padding: '10px' }}
            >
              <CheckCircle2 size={16} />
              Approve Voucher
            </button>
            <button
              type="button"
              className={`btn ${actionTab === 'reject' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => { setActionTab('reject'); setError(''); }}
              style={{ flex: 1, padding: '10px' }}
            >
              <XCircle size={16} />
              Reject Voucher
            </button>
          </div>

          {/* Approval Section */}
          {actionTab === 'approve' && (
            <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#166534', fontWeight: 600 }}>
                <CheckCircle2 size={18} />
                Executive Approval Authorization
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#15803d', marginBottom: 10 }}>
                By signing below, you authorize Prachay Securities accounts to disburse reimbursement of {formatCurrency(voucher.amount)} to {voucher.employee_name}.
              </p>
              <SignaturePad
                value={directorSignature}
                onChange={(sig) => setDirectorSignature(sig)}
                label="Director Executive Signature"
                defaultSignature={user?.default_signature}
                required={true}
              />
            </div>
          )}

          {/* Rejection Section */}
          {actionTab === 'reject' && (
            <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#991b1b', fontWeight: 600 }}>
                <XCircle size={18} />
                Rejection Remarks & Feedback
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#b91c1c', marginBottom: 10 }}>
                Specify why this voucher is being rejected. The employee will view these remarks directly on their dashboard.
              </p>
              <label className="form-label required" style={{ color: '#991b1b' }}>
                Rejection Reason (Mandatory)
              </label>
              <textarea
                rows={4}
                className="form-textarea"
                placeholder="e.g. Missing valid GST tax invoice. Please upload itemized hotel folio and resubmit."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ borderColor: '#fca5a5' }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          {actionTab === 'approve' ? (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleConfirmApproval}
              disabled={submitting}
            >
              <CheckCircle2 size={16} />
              Confirm & Sign Approval
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmRejection}
              disabled={submitting}
            >
              <XCircle size={16} />
              Confirm Rejection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
