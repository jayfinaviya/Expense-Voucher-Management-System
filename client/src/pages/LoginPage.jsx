import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Briefcase, Lock, Mail, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, demoUsers } = useAuth();
  const [email, setEmail] = useState('employee@prachay.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        maxWidth: 480,
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.1), 0 8px 12px -6px rgba(15, 23, 42, 0.05)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Brand Header */}
        <div style={{
          background: '#0f172a',
          color: '#ffffff',
          padding: '28px 32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.5rem',
            margin: '0 auto 14px auto',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.4)'
          }}>
            P
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            PRACHAY SECURITIES
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: 4 }}>
            Expense Voucher Management Portal
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '32px' }}>
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
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Evaluator Access Section */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
              textAlign: 'center'
            }}>
              1-Click Evaluator Quick Login
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {demoUsers.map((demo) => {
                const getRoleIcon = () => {
                  if (demo.role === 'director') return <ShieldCheck size={14} color="#7c3aed" />;
                  if (demo.role === 'accounts') return <Briefcase size={14} color="#059669" />;
                  return <UserCheck size={14} color="#2563eb" />;
                };

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
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getRoleIcon()}
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
                      color: demo.role === 'director' ? '#7c3aed' : demo.role === 'accounts' ? '#059669' : '#2563eb',
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
