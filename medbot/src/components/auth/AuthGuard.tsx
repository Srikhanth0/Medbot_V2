import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#11222C]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0891B2]"></div>
      </div>
    );
  }

  const authenticated = Boolean(isSignedIn || isAuthenticated);

  // Protect private routes: if route requires auth but user is not signed in
  if (requireAuth && !authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Auth pages (login/signup): if user is already signed in via Clerk, redirect to dashboard
  if (!requireAuth && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
