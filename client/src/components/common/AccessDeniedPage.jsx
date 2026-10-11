import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AccessDeniedPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getAuthorizedPath = () => {
    if (!user) return '/login';
    if (user.role === 'employee') return '/employee';
    if (user.role === 'director') return '/management';
    if (user.role === 'accounts') return '/accounts';
    return '/login';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #fef2f2 0%, #f8fafc 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: 540,
        width: '100%',
        background: '#ffffff',
        borderRadius: 16,
        padding: '40px 32px',
        boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 8px 10px -6px rgba(239, 68, 68, 0.05)',
        border: '1px solid #fee2e2',
        textAlign: 'center'
      }}>
        {/* Shield Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
        }}>
          <ShieldAlert size={36} />
        </div>

        {/* 403 Badge */}
        <div style={{
          display: 'inline-block',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 16
        }}>
          HTTP 403 • ACCESS FORBIDDEN
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: 12,
          fontFamily: 'var(--font-heading)'
        }}>
          Access Restricted by Policy
        </h1>

        <p style={{
          fontSize: '0.9375rem',
          color: '#64748b',
          lineHeight: 1.6,
          marginBottom: 24
        }}>
          You do not have administrative privileges to access this management area.
          {user && (
            <span>
              {' '}Your authenticated account is registered under the{' '}
              <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{user.role}</strong>{' '}
              role and is restricted to your designated workspace.
            </span>
          )}
        </p>

        {/* Security Info Card */}
        <div style={{
          background: '#f8fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          padding: '12px 16px',
          marginBottom: 28,
          fontSize: '0.8125rem',
          color: '#475569',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <Lock size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
          <div>
            <strong>Strict Role-Based Access Control Active:</strong>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Management portals are reserved exclusively for authorized Directors. Unauthorized access attempts are monitored and denied.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate(getAuthorizedPath())}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
          >
            <ArrowLeft size={16} />
            Return to My Dashboard
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              background: '#ffffff',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              padding: '10px 16px',
              borderRadius: 8,
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
