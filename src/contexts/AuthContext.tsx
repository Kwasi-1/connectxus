import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthUser,
  AuthContextType,
  SignInFormData,
  SignUpFormData,
} from "@/types/auth";
import { login, register } from "@/api/auth.api";
import { logout as apiLogout } from "@/api/auth.api";
import { isAuthenticated } from "@/lib/apiClient";
import { toast } from "sonner";
import { initWebSocket } from "@/lib/websocket";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth-user");
    const hasToken = isAuthenticated();

    if (storedUser && hasToken) {
      try {
        setUser(JSON.parse(storedUser));
        initWebSocket().catch((error) => {
          console.error("Failed to initialize WebSocket:", error);
        });
      } catch (error) {
        localStorage.removeItem("auth-user");
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      const authUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.full_name,
        avatar: response.user.avatar,
        university: "",
        department: "",
        level: "",
        interests: [],
        createdAt: response.user.created_at
          ? new Date(response.user.created_at)
          : new Date(),
      };

      setUser(authUser);
      localStorage.setItem("auth-user", JSON.stringify(authUser));

      initWebSocket().catch((error) => {
        console.error("Failed to initialize WebSocket:", error);
      });

      toast.success("Welcome back!");
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await register({
        space_id: data.space_id,
        username: data.username,
        email: data.email,
        password: data.password,
        is_student: data.is_student,
        level: data.level ? parseInt(data.level, 10) : null,
        department_id: data.department_id || null,
        major: null,
        year: null,
        interests: data.interests || [],
        phone_number: data.phoneNumber,
      });

      toast.success("Account created successfully! Please log in.");
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await apiLogout();
      setUser(null);
      localStorage.removeItem("auth-user");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      localStorage.removeItem("auth-user");
    }
  };

  const setAuthUser = (userData: any, isNewUser: boolean = false) => {
    const authUser: AuthUser = {
      id: userData.id,
      email: userData.email,
      name: userData.full_name,
      avatar: userData.avatar,
      university: "",
      department: "",
      level: "",
      interests: [],
      createdAt: userData.created_at
        ? new Date(userData.created_at)
        : new Date(),
    };

    setUser(authUser);
    localStorage.setItem("auth-user", JSON.stringify(authUser));

    initWebSocket().catch((error) => {
      console.error("Failed to initialize WebSocket:", error);
    });

    if (isNewUser) {
      toast.success("Welcome! Your account has been created.");
    } else {
      toast.success("Welcome back!");
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    setAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
