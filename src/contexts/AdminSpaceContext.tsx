import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminApi, Space } from '@/api/admin.api';
import { useQuery } from '@tanstack/react-query';

interface AdminSpaceContextType {
  selectedSpaceId: string | null; 
  setSelectedSpaceId: (spaceId: string | null) => void;
  spaces: Space[];
  isLoadingSpaces: boolean;
}

const AdminSpaceContext = createContext<AdminSpaceContextType | undefined>(undefined);

export const useAdminSpace = () => {
  const context = useContext(AdminSpaceContext);
  if (!context) {
    throw new Error('useAdminSpace must be used within an AdminSpaceProvider');
  }
  return context;
};

export const AdminSpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSpaceId, setSelectedSpaceIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem('admin-selected-space');
    return saved || null;
  });

  const { data: spaces = [], isLoading: isLoadingSpaces } = useQuery({
    queryKey: ['admin-spaces'],
    queryFn: () => adminApi.getSpaces(),
    staleTime: 5 * 60 * 1000, 
  });

  const setSelectedSpaceId = (spaceId: string | null) => {
    setSelectedSpaceIdState(spaceId);
    if (spaceId) {
      localStorage.setItem('admin-selected-space', spaceId);
    } else {
      localStorage.removeItem('admin-selected-space');
    }
  };

  const value: AdminSpaceContextType = {
    selectedSpaceId,
    setSelectedSpaceId,
    spaces,
    isLoadingSpaces,
  };

  return <AdminSpaceContext.Provider value={value}>{children}</AdminSpaceContext.Provider>;
};