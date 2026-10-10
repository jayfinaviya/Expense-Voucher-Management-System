import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { Eye, Printer, Edit2, Trash2, Send, CheckSquare, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export const VoucherTable = ({
  vouchers,
  sortBy,
  sortOrder,
  onSort,
  onViewDetails,
  onPrintSlip,
  onEditDraft,
  onDeleteDraft,
  onSubmitDraft,
  onReviewDirector
}) => {
  const { user } = useAuth();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={12} color="#94a3b8" />;
    return sortOrder === 'ASC' ? <ArrowUp size={12} color="#1d4ed8" /> : <ArrowDown size={12} color="#1d4ed8" />;
  };

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: '#64748b'
        }}>
          <Eye size={24} />
        </div>
        <h4 style={{ fontSize: '1.125rem', color: '#1e293b', marginBottom: 6 }}>No Expense Vouchers Found</h4>
        <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: 420, margin: '0 auto' }}>
          No vouchers match your current filter criteria or search query. Try clearing filters or creating a new voucher.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => onSort('voucher_number')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Voucher # {renderSortIcon('voucher_number')}
              </div>
            </th>
            <th onClick={() => onSort('expense_date')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Expense Date {renderSortIcon('expense_date')}
              </div>
            </th>
            {user?.role !== 'employee' && (
              <th onClick={() => onSort('employee_name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Employee {renderSortIcon('employee_name')}
                </div>
              </th>
            )}
            <th>Department / Category</th>
            <th>Expense Title</th>
            <th onClick={() => onSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                Amount {renderSortIcon('amount')}
              </div>
            </th>
            <th onClick={() => onSort('status')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Status {renderSortIcon('status')}
              </div>
            </th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => {
            const isEmployeeOwner = user?.role === 'employee' && v.created_by_user_id === user.id;
            const isDraft = v.status === 'Draft';
            const isPending = v.status === 'Pending Approval';
            const isDirector = user?.role === 'director';

            return (
              <tr key={v.id}>
                {/* Voucher Number */}
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

                {/* Expense Date */}
                <td>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{v.expense_date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Filed: {v.voucher_date}</div>
                </td>

                {/* Employee (for Director & Accounts) */}
                {user?.role !== 'employee' && (
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.employee_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.employee_id || 'ID: N/A'}</div>
                  </td>
                )}

                {/* Department & Category */}
                <td>
                  <div style={{ fontWeight: 500, color: '#1e293b' }}>{v.department}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.expense_category}</div>
                </td>

                {/* Expense Title */}
                <td style={{ maxWidth: 260 }}>
                  <div style={{
                    fontWeight: 600,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {v.expense_title}
                  </div>
                  {v.expense_description && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {v.expense_description}
                    </div>
                  )}
                  {v.status === 'Rejected' && v.rejection_reason && (
                    <div style={{
                      fontSize: '0.6875rem',
                      color: '#b91c1c',
                      background: '#fee2e2',
                      padding: '2px 6px',
                      borderRadius: 4,
                      marginTop: 4,
                      display: 'inline-block'
                    }}>
                      Reason: {v.rejection_reason}
                    </div>
                  )}
                </td>

                {/* Amount */}
                <td style={{ textAlign: 'right' }}>
                  <span className="mono-num" style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    {formatCurrency(v.amount)}
                  </span>
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={v.status} />
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {/* View Details */}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewDetails(v)}
                      title="View Voucher Details"
                      style={{ padding: '5px 8px' }}
                    >
                      <Eye size={13} />
                    </button>

                    {/* Print Slip (for all, especially Accounts) */}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onPrintSlip(v)}
                      title="Print Official Voucher Slip"
                      style={{ padding: '5px 8px' }}
                    >
                      <Printer size={13} />
                    </button>

                    {/* Director Review & Approve / Reject Action */}
                    {isDirector && isPending && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onReviewDirector(v)}
                        style={{ padding: '5px 10px', fontSize: '0.75rem', background: '#059669', borderColor: '#059669' }}
                      >
                        <CheckSquare size={13} />
                        Review
                      </button>
                    )}

                    {/* Employee Draft Actions */}
                    {isEmployeeOwner && isDraft && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => onSubmitDraft(v)}
                          title="Submit for Director Approval"
                          style={{ padding: '5px 8px' }}
                        >
                          <Send size={13} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onEditDraft(v)}
                          title="Edit Draft Voucher"
                          style={{ padding: '5px 8px' }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onDeleteDraft(v)}
                          title="Delete Draft Voucher"
                          style={{ padding: '5px 8px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
