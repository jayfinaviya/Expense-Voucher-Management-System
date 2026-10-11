import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { voucherApi } from '../api/voucherApi';
import { VoucherFilterBar } from '../components/vouchers/VoucherFilterBar';
import { VoucherTable } from '../components/vouchers/VoucherTable';
import { PlusCircle, Layers, FileText, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export const VouchersPage = ({
  initialStatus = 'All',
  pageTitle = 'Expense Vouchers',
  pageSubtitle = 'Manage and audit expense voucher reimbursement records',
  onOpenCreate,
  onViewDetails,
  onPrintSlip,
  onEditDraft,
  onReviseDraft,
  onReviewDirector,
  showToast
}) => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    voucherNumber: '',
    employeeName: '',
    status: initialStatus,
    department: 'All',
    category: 'All',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    setFilters(prev => ({ ...prev, status: initialStatus }));
  }, [initialStatus]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await voucherApi.getVouchers({
        ...filters,
        sortBy,
        sortOrder,
        page,
        limit: 15
      });
      if (res.success) {
        setVouchers(res.vouchers || []);
        setPagination(res.pagination || { total: 0, totalPages: 1 });
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to load expense vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [filters, sortBy, sortOrder, page, user]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      voucherNumber: '',
      employeeName: '',
      status: 'All',
      department: 'All',
      category: 'All',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setPage(1);
  };

  // Employee action: delete draft
  const handleDeleteDraft = async (v) => {
    if (!window.confirm(`Are you sure you want to permanently delete draft voucher "${v.voucher_number}"?`)) {
      return;
    }
    try {
      const res = await voucherApi.deleteVoucher(v.id);
      showToast('success', res.message || 'Draft deleted successfully');
      fetchVouchers();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete draft');
    }
  };

  // Employee action: submit draft
  const handleSubmitDraft = async (v) => {
    if (!v.employee_signature) {
      onEditDraft(v);
      showToast('error', 'Employee signature is mandatory before submitting for approval. Please sign and submit.');
      return;
    }
    try {
      const res = await voucherApi.submitVoucher(v.id, v.employee_signature);
      showToast('success', res.message || 'Voucher submitted for approval!');
      fetchVouchers();
    } catch (err) {
      showToast('error', err.message || 'Failed to submit voucher');
    }
  };

  // Export to CSV functionality (bonus for accounts & management)
  const handleExportCSV = () => {
    if (!vouchers || vouchers.length === 0) return;

    const headers = [
      'Voucher Number',
      'Voucher Date',
      'Expense Date',
      'Employee Name',
      'Employee ID',
      'Department',
      'Category',
      'Title',
      'Amount',
      'Status',
      'Director Name',
      'Approval Date'
    ];

    const rows = vouchers.map(v => [
      v.voucher_number,
      v.voucher_date,
      v.expense_date,
      `"${v.employee_name}"`,
      v.employee_id || '',
      `"${v.department}"`,
      `"${v.expense_category}"`,
      `"${(v.expense_title || '').replace(/"/g, '""')}"`,
      v.amount,
      v.status,
      v.director_name || '',
      v.approval_date || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Prachay_Expense_Vouchers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Exported ${vouchers.length} vouchers to CSV.`);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20
      }}>
        <div>
          <h2 style={{ fontSize: '1.375rem', color: '#0f172a' }}>{pageTitle}</h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{pageSubtitle}</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {vouchers.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              title="Export current view to CSV"
            >
              <Download size={14} />
              Export CSV
            </button>
          )}

          {user?.role === 'employee' && onOpenCreate && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenCreate}
            >
              <PlusCircle size={15} />
              Create Voucher
            </button>
          )}
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <VoucherFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Table */}
      {loading ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
          Loading expense records...
        </div>
      ) : (
        <>
          <VoucherTable
            vouchers={vouchers}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onViewDetails={onViewDetails}
            onPrintSlip={onPrintSlip}
            onEditDraft={onEditDraft}
            onReviseDraft={onReviseDraft}
            onDeleteDraft={handleDeleteDraft}
            onSubmitDraft={handleSubmitDraft}
            onReviewDirector={onReviewDirector}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 16,
              padding: '12px 16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8
            }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total vouchers)
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
