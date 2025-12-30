import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser, AdminAuthContextType, AdminPermission, AdminRole } from '@/types/admin';
import { adminApi, AdminUser as ApiAdminUser } from '@/api/admin.api';
import { toast } from 'sonner';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
        const storedAdmin = localStorage.getItem('admin-user');
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        localStorage.removeItem('admin-user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await adminApi.login({ email, password });

      const apiUser = response.user;

      const getPermissionsByRole = (role: string): AdminPermission[] => {
        const rolePermissions: Record<string, AdminPermission[]> = {
          'super_admin': [
            'user_management',
            'content_management',
            'community_management',
            'tutoring_management',
            'analytics',
            'admin_management',
            'system_settings',
            'reports',
            'notifications'
          ],
          'admin': [
            'user_management',
            'content_management',
            'community_management',
            'tutoring_management',
            'analytics',
            'reports',
            'notifications'
          ],
          'moderator': [
            'content_management',
            'community_management',
            'reports'
          ]
        };

        return rolePermissions[role] || rolePermissions['moderator'];
      };

      const adminUser: AdminUser = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.full_name,
        role: apiUser.role as AdminRole,
        permissions: getPermissionsByRole(apiUser.role),
        avatar: apiUser.avatar || undefined,
        university: 'University',
        department: apiUser.department_id || undefined,
        createdAt: apiUser.created_at ? new Date(apiUser.created_at) : new Date(),
        lastLogin: new Date(),
        isActive: true,
      };

      setAdmin(adminUser);
      localStorage.setItem('admin-user', JSON.stringify(adminUser));
    } catch (error: any) {
      console.error('Admin sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      localStorage.removeItem('admin-user');
    }
  };

  const hasPermission = (permission: AdminPermission): boolean => {
    if (!admin) return false;
    return admin.permissions.includes(permission);
  };

  const hasRole = (role: AdminRole): boolean => {
    if (!admin) return false;
    return admin.role === role;
  };

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    signIn,
    signOut,
    hasPermission,
    hasRole,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};