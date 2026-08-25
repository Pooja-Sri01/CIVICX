import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'MUNICIPAL' | 'CITIZEN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = 'MUNICIPAL' }) => {
  const { isAuthenticated, user, isCitizen, isMunicipal, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-civic-dark border-t-lime animate-spin" />
      </div>
    );
  }

  // If not logged in, redirect to unified login
  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If municipal role required but citizen is logged in -> redirect to citizen portal
  if (requiredRole === 'MUNICIPAL' && isCitizen) {
    return <Navigate to="/citizen/portal" replace />;
  }

  // If citizen role required but municipal is logged in -> allow or redirect
  if (requiredRole === 'CITIZEN' && isMunicipal && !isCitizen) {
    // Municipal officers can access citizen pages for testing/intake, but by default pass
    return <>{children}</>;
  }

  return <>{children}</>;
};
