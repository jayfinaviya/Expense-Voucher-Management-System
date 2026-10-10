import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Briefcase, Lock, Mail, ArrowRight, AlertCircle, Building2, User, Shield } from 'lucide-react';

export const LoginPage = () => {
  const { login, demoUsers } = useAuth();
  const [portalType, setPortalType] = useState('employee'); // 'employee' or 'admin'
  const [email, setEmail] = useState('employee@prachay.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePortalChange = (type) => {
    setPortalType(type);
    setError('');
    if (type === 'employee') {
      setEmail('employee@prachay.com');
    } else {
      setEmail('director@prachay.com');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail) => {
    setEmail(userEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await login(userEmail, 'password123');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const relevantDemoUsers = demoUsers.filter(u => 
    portalType === 'employee' ? u.role === 'employee' : u.role !== 'employee'
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #f1f5f9 0%, #e2e8f0 100%)',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.12), 0 8px 12px -6px rgba(15, 23, 42, 0.06)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Brand Header */}
        <div style={{
          background: portalType === 'employee' ? '#0f172a' : '#091e42',
          color: '#ffffff',
          padding: '26px 32px',
          textAlign: 'center',
          transition: 'background 200ms ease'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: portalType === 'employee' 
              ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' 
              : 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.5rem',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
          }}>
            P
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            PRACHAY SECURITIES
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: 2 }}>
            Expense Voucher Management System
          </p>
        </div>

        {/* Portal Selection Tabs (Separates User Side vs Admin Side) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => handlePortalChange('employee')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: portalType === 'employee' ? '#ffffff' : 'transparent',
              color: portalType === 'employee' ? '#1d4ed8' : '#64748b',
              fontWeight: portalType === 'employee' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              borderBottom: portalType === 'employee' ? '2px solid #2563eb' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 120ms ease'
            }}
          >
            <User size={16} />
            User Side (Employee)
          </button>

          <button
            type="button"
            onClick={() => handlePortalChange('admin')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: portalType === 'admin' ? '#ffffff' : 'transparent',
              color: portalType === 'admin' ? '#6d28d9' : '#64748b',
              fontWeight: portalType === 'admin' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              borderBottom: portalType === 'admin' ? '2px solid #7c3aed' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 120ms ease'
            }}
          >
            <Shield size={16} />
            Admin Side (Management)
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 32px' }}>
          {/* Active Portal Banner */}
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 20,
            fontSize: '0.8125rem',
            background: portalType === 'employee' ? '#eff6ff' : '#f5f3ff',
            border: portalType === 'employee' ? '1px solid #bfdbfe' : '1px solid #ddd6fe',
            color: portalType === 'employee' ? '#1e40af' : '#5b21b6',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            {portalType === 'employee' ? <UserCheck size={16} /> : <ShieldCheck size={16} />}
            <span>
              <strong>{portalType === 'employee' ? 'Employee Self-Service Portal' : 'Executive & Accounts Portal'}:</strong>{' '}
              {portalType === 'employee' 
                ? 'Create, edit, sign, and submit personal reimbursement requests.' 
                : 'Director approvals, organizational ledger audit, and payout processing.'}
            </span>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: 6,
              marginBottom: 20,
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Corporate Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@prachay.com"
                  style={{ paddingLeft: 38 }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label required">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{ paddingLeft: 38 }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: portalType === 'employee' ? '#2563eb' : '#6d28d9',
                borderColor: portalType === 'employee' ? '#2563eb' : '#6d28d9'
              }}
            >
              {loading ? 'Authenticating...' : `Enter ${portalType === 'employee' ? 'Employee Portal' : 'Admin Portal'}`}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick 1-Click Evaluator Switchers For Selected Portal */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
              textAlign: 'center'
            }}>
              1-Click Demo Login ({portalType === 'employee' ? 'User Side' : 'Admin Side'})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {relevantDemoUsers.map((demo) => {
                const isDir = demo.role === 'director';
                const isAcc = demo.role === 'accounts';

                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleQuickLogin(demo.email)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 120ms ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDir ? '#f5f3ff' : isAcc ? '#f0fdf4' : '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isDir ? <ShieldCheck size={16} color="#7c3aed" /> : isAcc ? <Briefcase size={16} color="#059669" /> : <UserCheck size={16} color="#2563eb" />}
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                          {demo.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {demo.email} • {demo.department}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isDir ? '#7c3aed' : isAcc ? '#059669' : '#2563eb',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}>
                      {demo.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
