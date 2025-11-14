
import apiClient, { setAccessToken, setRefreshToken, clearTokens, getDefaultSpaceId } from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  space_id: string;
  username: string;
  email: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  verified?: boolean | null;
  roles?: string[];
  followers_count?: number | null;
  following_count?: number | null;
  created_at?: string | null;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: User;
}

export interface RegisterRequest {
  space_id: string;
  username: string;
  email: string;
  password: string;
  full_name: string;
  level?: string | null;
  department?: string | null;
  major?: string | null;
  year?: number | null;
  interests?: string[];
}

export interface RegisterResponseData {
  id: string;
  space_id: string;
  username: string;
  email: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  level?: string | null;
  department?: string | null;
  major?: string | null;
  year?: number | null;
  interests?: string[];
  created_at: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponseData {
  access_token: string;
  access_token_expires_at: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/users/login', data);

    setAccessToken(response.data.data.access_token);
  setRefreshToken(response.data.data.refresh_token);

  return response.data.data;
};

export const register = async (data: Omit<RegisterRequest, 'space_id'>): Promise<RegisterResponseData> => {
  const spaceId = getDefaultSpaceId();

  if (!spaceId) {
    throw new Error('Space ID is required. Please configure VITE_DEFAULT_SPACE_ID in your environment.');
  }

  const requestData: RegisterRequest = {
    ...data,
    space_id: spaceId,
  };

  const response = await apiClient.post<ApiResponse<RegisterResponseData>>('/users', requestData);

    return response.data.data;
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/users/logout');
  } finally {
    clearTokens();
  }
};

export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponseData> => {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponseData>>(
    '/users/refresh',
    { refresh_token: refreshToken }
  );

    setAccessToken(response.data.data.access_token);

  return response.data.data;
};

export const authApi = {
  login,
  register,
  logout,
  refreshToken,
};

export default authApi;
