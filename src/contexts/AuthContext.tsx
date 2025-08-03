
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, AuthContextType, SignInFormData, SignUpFormData } from '@/types/auth';
import * as authAPI from '@/lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('auth-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const user = await authAPI.signIn(data);
      setUser(user);
      localStorage.setItem('auth-user', JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const user = await authAPI.signUp(data);
      setUser(user);
      localStorage.setItem('auth-user', JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('auth-user');
    authAPI.signOut();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
