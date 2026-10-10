import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('evms_token') || null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load demo accounts for easy switching and evaluation
  useEffect(() => {
    authApi.getDemoUsers()
      .then(res => {
        if (res.success) {
          setDemoUsers(res.demoUsers);
        }
      })
      .catch(err => console.error('Failed to load demo accounts:', err));
  }, []);

  // Validate session on start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('evms_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('evms_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('evms_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('evms_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('evms_token');
    setToken(null);
    setUser(null);
  };

  // Instant role switch for evaluator convenience
  const switchRole = async (targetEmail) => {
    try {
      const res = await authApi.login(targetEmail, 'password123');
      if (res.success && res.token) {
        localStorage.setItem('evms_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('Role switch failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoUsers,
        login,
        logout,
        switchRole,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
