import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, PlusCircle, CheckSquare, Layers, ShieldCheck, DollarSign } from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, pendingCount = 0 }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getNavItems = () => {
    if (role === 'employee') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'vouchers', label: 'My Expense Vouchers', icon: <FileText size={18} /> },
        { id: 'create', label: 'Create New Voucher', icon: <PlusCircle size={18} />, highlight: true }
      ];
    }

    if (role === 'director') {
      return [
        { id: 'dashboard', label: 'Director Dashboard', icon: <LayoutDashboard size={18} /> },
        {
          id: 'pending',
          label: 'Pending Approvals',
          icon: <CheckSquare size={18} />,
          badge: pendingCount > 0 ? pendingCount : null
        },
        { id: 'all_vouchers', label: 'All Company Vouchers', icon: <Layers size={18} /> }
      ];
    }

    if (role === 'accounts') {
      return [
        { id: 'dashboard', label: 'Accounts Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'all_vouchers', label: 'All Vouchers Audit', icon: <Layers size={18} /> },
        { id: 'reimbursements', label: 'Approved Reimbursements', icon: <DollarSign size={18} /> }
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <aside className="sidebar no-print" style={{
      width: 250,
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      minHeight: 'calc(100vh - 105px)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }}>
      <div style={{
        fontSize: '0.6875rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#94a3b8',
        padding: '0 12px 10px 12px'
      }}>
        Navigation
      </div>

      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: isActive ? '#eff6ff' : 'transparent',
              color: isActive ? '#1d4ed8' : '#334155',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: isActive ? '#1d4ed8' : '#64748b' }}>
                {item.icon}
              </span>
              {item.label}
            </div>

            {item.badge && (
              <span style={{
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 9999,
                lineHeight: 1.2
              }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
        <div style={{
          padding: '12px',
          background: '#f8fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: 2 }}>
            Prachay Audit Trail
          </div>
          Voucher Workflow:
          <div style={{ marginTop: 4, color: '#475569', fontSize: '0.6875rem', lineHeight: 1.4 }}>
            Draft ➔ Pending ➔ Director Approval ➔ Accounts Reimbursement
          </div>
        </div>
      </div>
    </aside>
  );
};
