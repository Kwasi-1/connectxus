import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser, AdminAuthContextType, AdminPermission, AdminRole } from '@/types/admin';

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
            const mockAdmin: AdminUser = {
        id: '1',
        email,
        name: 'John Admin',
        role: email.includes('super') ? 'super_admin' : 'admin',
        permissions: email.includes('super') 
          ? ['user_management', 'content_management', 'community_management', 'tutoring_management', 'analytics', 'admin_management', 'system_settings', 'reports', 'notifications']
          : ['user_management', 'content_management', 'community_management', 'tutoring_management', 'analytics', 'reports'],
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        university: 'University of Ghana',
        department: 'Student Affairs',
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
      };
      
      setAdmin(mockAdmin);
      localStorage.setItem('admin-user', JSON.stringify(mockAdmin));
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setAdmin(null);
    localStorage.removeItem('admin-user');
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