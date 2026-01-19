import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminAuthPage } from '@/pages/admin/AdminAuthPage';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminPermission, AdminRole } from '@/types/admin';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermission;
  requiredRole?: AdminRole;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredRole 
}) => {
  const { admin, isLoading, hasPermission, hasRole } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!admin) {
    return <AdminAuthPage />;
  }

    if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        </div>
      </div>
    );
  }

    if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};