import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, LogOut, ShieldCheck, UserCheck, Users, Briefcase } from 'lucide-react';

export const Navbar = ({ onOpenNewVoucher }) => {
  const { user, logout, switchRole, demoUsers } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'director':
        return { label: 'Director (Admin)', bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe', icon: <ShieldCheck size={14} /> };
      case 'accounts':
        return { label: 'Accounts Team', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', icon: <Briefcase size={14} /> };
      default:
        return { label: 'Employee', bg: '#f1f5f9', text: '#334155', border: '#cbd5e1', icon: <UserCheck size={14} /> };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="navbar no-print" style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Top Evaluation Quick Switch Bar */}
      <div style={{
        background: '#0f172a',
        color: '#f8fafc',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: '#334155',
            padding: '2px 8px',
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#93c5fd'
          }}>
            Evaluator Switcher
          </span>
          <span style={{ color: '#94a3b8' }}>
            Switch active persona to test role permissions instantly:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {demoUsers.map((demo) => {
            const isActive = user?.email === demo.email;
            return (
              <button
                key={demo.id}
                onClick={() => switchRole(demo.email)}
                style={{
                  background: isActive ? '#2563eb' : '#1e293b',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  border: isActive ? '1px solid #60a5fa' : '1px solid #334155',
                  padding: '3px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 150ms ease'
                }}
              >
                {demo.role === 'employee' ? `Employee: ${demo.name.split(' ')[0]}` : demo.role === 'director' ? 'Director: Sarah' : 'Accounts: Rohit'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 28px',
        maxWidth: 1600,
        margin: '0 auto'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)',
            boxShadow: '0 2px 4px rgba(30, 58, 138, 0.25)'
          }}>
            P
          </div>
          <div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#0f172a',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              PRACHAY SECURITIES
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                background: '#f1f5f9',
                color: '#475569',
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid #e2e8f0'
              }}>
                CORPORATE
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Expense Voucher Management System
            </div>
          </div>
        </div>

        {/* User Profile & Actions */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user.role === 'employee' && onOpenNewVoucher && (
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenNewVoucher}
                style={{ padding: '8px 16px' }}
              >
                + New Expense Voucher
              </button>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '6px 14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: '#334155'
              }}>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {user.department} {user.employee_id ? `• ${user.employee_id}` : ''}
                </div>
              </div>

              {badge && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: badge.bg,
                  color: badge.text,
                  border: `1px solid ${badge.border}`,
                  marginLeft: 4
                }}>
                  {badge.icon}
                  {badge.label}
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
              style={{ color: '#64748b' }}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
