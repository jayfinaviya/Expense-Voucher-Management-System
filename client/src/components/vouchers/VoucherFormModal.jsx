import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SignaturePad } from '../common/SignaturePad';
import { X, Save, Send, AlertCircle, FileText } from 'lucide-react';

export const VoucherFormModal = ({ isOpen, onClose, onSubmit, editingVoucher = null }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    department: user?.department || 'Engineering',
    expense_title: '',
    expense_category: 'Software & Subscriptions',
    expense_description: '',
    amount: '',
    employee_id: user?.employee_id || '',
    signature: user?.default_signature || ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingVoucher) {
      setFormData({
        expense_date: editingVoucher.expense_date || new Date().toISOString().split('T')[0],
        department: editingVoucher.department || user?.department || 'Engineering',
        expense_title: editingVoucher.expense_title || '',
        expense_category: editingVoucher.expense_category || 'Software & Subscriptions',
        expense_description: editingVoucher.expense_description || '',
        amount: editingVoucher.amount || '',
        employee_id: editingVoucher.employee_id || user?.employee_id || '',
        signature: editingVoucher.signature || editingVoucher.employee_signature || user?.default_signature || ''
      });
    } else {
      setFormData({
        expense_date: new Date().toISOString().split('T')[0],
        department: user?.department || 'Engineering',
        expense_title: '',
        expense_category: 'Software & Subscriptions',
        expense_description: '',
        amount: '',
        employee_id: user?.employee_id || '',
        signature: user?.default_signature || ''
      });
    }
    setErrors({});
  }, [editingVoucher, isOpen, user]);

  if (!isOpen) return null;

  const validate = (action) => {
    const errs = {};
    if (!formData.department || !formData.department.trim()) {
      errs.department = 'Department is mandatory.';
    }
    if (!formData.expense_title || !formData.expense_title.trim()) {
      errs.expense_title = 'Expense Title is mandatory.';
    }
    if (!formData.expense_date) {
      errs.expense_date = 'Expense Date is mandatory.';
    }
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      errs.amount = 'Amount is mandatory.';
    } else if (parseFloat(formData.amount) <= 0) {
      errs.amount = 'Amount must be greater than zero.';
    }

    if (action === 'submit' && !formData.signature) {
      errs.signature = 'Employee Signature is mandatory before submission for approval.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitAction = async (action) => {
    if (!validate(action)) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        action // 'draft' or 'submit'
      });
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'An error occurred while saving the voucher.' });
    } finally {
      setSubmitting(false);
    }
  };

  const departments = [
    'Engineering',
    'Marketing',
    'Operations',
    'Finance & Accounts',
    'Executive Management',
    'Sales',
    'Human Resources',
    'Legal & Compliance'
  ];

  const categories = [
    'Software & Subscriptions',
    'Client Meeting',
    'Office Supplies',
    'Travel & Lodging',
    'Hardware & Equipment',
    'Training & Certification',
    'Utilities',
    'Other'
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} color="#1d4ed8" />
              {editingVoucher?.isRevision
                ? 'Create Revised Expense Claim (New Draft)'
                : editingVoucher?.id
                ? `Edit Draft Voucher: ${editingVoucher.voucher_number}`
                : 'Create New Expense Voucher'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 2 }}>
              {editingVoucher?.isRevision
                ? 'Adjust the necessary fields or remarks based on Director feedback, then save as draft or re-submit.'
                : 'Fill in all mandatory expense details. Save as draft or attach signature to submit immediately.'}
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

        {/* Modal Body */}
        <div className="modal-body">
          {errors.form && (
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
              <AlertCircle size={18} />
              {errors.form}
            </div>
          )}

          {/* Top metadata grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {/* Voucher Date (auto) */}
            <div className="form-group">
              <label className="form-label">Voucher Date</label>
              <input
                type="text"
                className="form-input"
                value={editingVoucher?.voucher_date || new Date().toISOString().split('T')[0]}
                disabled
                style={{ background: '#f8fafc', color: '#64748b' }}
              />
            </div>

            {/* Expense Date (mandatory) */}
            <div className="form-group">
              <label className="form-label required">Expense Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              />
              {errors.expense_date && <div className="form-error">{errors.expense_date}</div>}
            </div>

            {/* Department (mandatory) */}
            <div className="form-group">
              <label className="form-label required">Department</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <div className="form-error">{errors.department}</div>}
            </div>

            {/* Expense Category (mandatory) */}
            <div className="form-group">
              <label className="form-label required">Expense Category</label>
              <select
                className="form-select"
                value={formData.expense_category}
                onChange={(e) => setFormData({ ...formData, expense_category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Title (mandatory) */}
          <div className="form-group">
            <label className="form-label required">Expense Title</label>
            <input
              type="text"
              placeholder="e.g. AWS Production Cloud Infrastructure & EC2 Scaling"
              className="form-input"
              value={formData.expense_title}
              onChange={(e) => setFormData({ ...formData, expense_title: e.target.value })}
            />
            {errors.expense_title && <div className="form-error">{errors.expense_title}</div>}
          </div>

          {/* Expense Description */}
          <div className="form-group">
            <label className="form-label">Expense Description & Business Justification</label>
            <textarea
              rows={3}
              placeholder="Provide context, attendees, client names, project name, or receipt references..."
              className="form-textarea"
              value={formData.expense_description}
              onChange={(e) => setFormData({ ...formData, expense_description: e.target.value })}
            />
          </div>

          {/* Amount & Employee ID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {/* Amount (mandatory, > 0) */}
            <div className="form-group">
              <label className="form-label required">Claimed Amount (INR ₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 600,
                  color: '#64748b'
                }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="form-input mono-num"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{ paddingLeft: 28, fontSize: '1rem', fontWeight: 600 }}
                />
              </div>
              {errors.amount && <div className="form-error">{errors.amount}</div>}
            </div>

            {/* Employee ID (optional) */}
            <div className="form-group">
              <label className="form-label">Employee ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. EMP-0412"
                className="form-input"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              />
            </div>
          </div>

          {/* Employee Signature Block */}
          <div style={{ marginTop: 10, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                Employee Signature Authorization
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Mandatory for submission to Director
              </span>
            </div>
            <SignaturePad
              value={formData.signature}
              onChange={(sig) => setFormData({ ...formData, signature: sig })}
              label="Draw or upload your handwritten signature"
              defaultSignature={user?.default_signature}
              required={false}
            />
            {errors.signature && <div className="form-error">{errors.signature}</div>}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSubmitAction('draft')}
            disabled={submitting}
          >
            <Save size={15} />
            Save as Draft
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmitAction('submit')}
            disabled={submitting}
          >
            <Send size={15} />
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
};
