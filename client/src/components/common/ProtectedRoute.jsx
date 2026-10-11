import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [], children, showToast }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        color: '#64748b',
        fontSize: '0.9375rem',
        fontWeight: 500
      }}>
        Verifying cryptographic session and authorization credentials...
      </div>
    );
  }

  // Not signed in -> send to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Check if role is allowed
  const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!isAllowed) {
    // Requirement 4: "Redirect employees attempting to access management URLs to their Employee Dashboard."
    if (user.role === 'employee') {
      return (
        <Navigate
          to="/employee"
          replace
          state={{
            accessDenied: true,
            deniedMessage: `Access Denied: Employees are strictly forbidden from accessing management URL "${location.pathname}".`
          }}
        />
      );
    }

    // Unauthorized non-employee roles
    return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />;
  }

  return children;
};
