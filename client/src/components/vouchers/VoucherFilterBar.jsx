import React, { useState } from 'react';
import { Search, Filter, X, Calendar, DollarSign, RotateCcw } from 'lucide-react';

export const VoucherFilterBar = ({ filters, onFilterChange, onResetFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const departments = [
    'All',
    'Engineering',
    'Marketing',
    'Operations',
    'Finance & Accounts',
    'Executive Management',
    'Sales'
  ];

  const categories = [
    'All',
    'Software & Subscriptions',
    'Client Meeting',
    'Office Supplies',
    'Travel & Lodging',
    'Hardware & Equipment',
    'Other'
  ];

  const statuses = ['All', 'Draft', 'Pending Approval', 'Approved', 'Rejected'];

  const hasActiveAdvancedFilters = !!(
    (filters.department && filters.department !== 'All') ||
    (filters.category && filters.category !== 'All') ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount
  );

  return (
    <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
      {/* Top Search & Primary Status Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 440 }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by Voucher #, Title, or Employee..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            style={{ paddingLeft: 38, fontSize: '0.875rem' }}
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Pill Selectors */}
        <div style={{
          display: 'flex',
          gap: 4,
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 8,
          border: '1px solid #e2e8f0'
        }}>
          {statuses.map((status) => {
            const isActive = (filters.status || 'All') === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => onFilterChange('status', status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#1d4ed8' : '#64748b',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 120ms ease'
                }}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Toggle Advanced Filters Button */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${showAdvanced || hasActiveAdvancedFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={14} />
            Filters {hasActiveAdvancedFilters ? '(Active)' : ''}
          </button>

          {(hasActiveAdvancedFilters || filters.search || (filters.status && filters.status !== 'All')) && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={onResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid #f1f5f9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          animation: 'fadeIn 150ms ease-out'
        }}>
          {/* Department Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
              Department
            </label>
            <select
              className="form-select"
              value={filters.department || 'All'}
              onChange={(e) => onFilterChange('department', e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '7px 10px' }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
              Expense Category
            </label>
            <select
              className="form-select"
              value={filters.category || 'All'}
              onChange={(e) => onFilterChange('category', e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '7px 10px' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
              Expense Date From
            </label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
            />
          </div>

          {/* Date Range: To */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
              Expense Date To
            </label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
            />
          </div>

          {/* Min Amount */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
              Min Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 1000"
              className="form-input"
              value={filters.minAmount || ''}
              onChange={(e) => onFilterChange('minAmount', e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '7px 10px' }}
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
              Max Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              className="form-input"
              value={filters.maxAmount || ''}
              onChange={(e) => onFilterChange('maxAmount', e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '7px 10px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
