import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser, AdminAuthContextType, AdminPermission, AdminRole } from '@/types/admin';
import { adminApi, AdminUser as ApiAdminUser, Space } from '@/api/admin.api';
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
  const [selectedSpaceId, setSelectedSpaceIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem('admin-current-space-id');
    return saved || null;
  });

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

  const setSelectedSpaceId = (spaceId: string | null) => {
    setSelectedSpaceIdState(spaceId);
    if (spaceId) {
      localStorage.setItem('admin-current-space-id', spaceId);
    } else {
      localStorage.removeItem('admin-current-space-id');
    }
  };

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

      try {
        const { spaces } = await adminApi.getSpaces({ limit: 100 });
        const spacesData = spaces.map((space: Space) => ({
          id: space.id,
          name: space.name,
        }));

        localStorage.setItem('admin-spaces', JSON.stringify(spacesData));

        if (!selectedSpaceId && spacesData.length > 0) {
          setSelectedSpaceId(spacesData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch spaces:', error);
      }
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
      setSelectedSpaceId(null);
      localStorage.removeItem('admin-user');
      localStorage.removeItem('admin-spaces');
      localStorage.removeItem('admin-current-space-id');
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
    selectedSpaceId,
    setSelectedSpaceId,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};