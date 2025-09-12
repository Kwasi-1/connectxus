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

  // Check permissions
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need {requiredRole} role to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};