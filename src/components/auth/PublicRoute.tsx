
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Logo from '../shared/Logo';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          {/* <div className="w-8 h-8 bg-primary rounded-full">Logo</div> */}
          <Logo className="animate-pulse rounded-full h-32 w-32" />
        </div>
      </div>
    );
  }

  // If user is logged in, redirect to feed
  if (user) {
    return <Navigate to="/feed" replace />;
  }

  // If not logged in, show the public page
  return <>{children}</>;
};
