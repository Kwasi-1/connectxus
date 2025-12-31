
import apiClient, { setAccessToken, setRefreshToken, clearTokens } from '@/lib/apiClient';

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
  is_student: boolean;
  level?: number | null;
  department_id?: string | null;
  major?: string | null;
  year?: number | null;
  interests?: string[];
  phone_number: string;
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

export interface GoogleSignInRequest {
  id_token: string;
}

export interface GoogleSignInNewUserResponse {
  new_user: boolean;
  email: string;
  full_name: string;
  avatar: string;
  id_token: string;
  needs_onboarding: boolean;
}

export interface GoogleSignInExistingUserResponse {
  new_user: boolean;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: User;
  needs_onboarding: boolean;
}

export type GoogleSignInResponse = GoogleSignInNewUserResponse | GoogleSignInExistingUserResponse;

export interface CompleteGoogleOnboardingRequest {
  id_token: string;
  space_id: string;
  department_id: string;
  username: string;
  phone_number: string;
  is_student: boolean;
  level?: string;
  major?: string;
  year?: number;
  interests?: string[];
}

export interface CompleteGoogleOnboardingResponse {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: User;
  is_new_user: boolean;
}

export const login = async (data: LoginRequest): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/users/login', data);

    setAccessToken(response.data.data.access_token);
  setRefreshToken(response.data.data.refresh_token);

  return response.data.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponseData> => {
  if (!data.space_id) {
    throw new Error('Space ID is required. Please select a space.');
  }

  const response = await apiClient.post<ApiResponse<RegisterResponseData>>('/users', data);

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

export const googleSignIn = async (idToken: string): Promise<GoogleSignInResponse> => {
  const response = await apiClient.post<ApiResponse<GoogleSignInResponse>>(
    '/users/auth/google',
    { id_token: idToken }
  );

  const data = response.data.data;

  if (!data.needs_onboarding && 'access_token' in data) {
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
  }

  return data;
};

export const completeGoogleOnboarding = async (
  data: CompleteGoogleOnboardingRequest
): Promise<CompleteGoogleOnboardingResponse> => {
  const response = await apiClient.post<ApiResponse<CompleteGoogleOnboardingResponse>>(
    '/users/auth/google/complete-onboarding',
    data
  );

  const responseData = response.data.data;

  setAccessToken(responseData.access_token);
  setRefreshToken(responseData.refresh_token);

  return responseData;
};

export const authApi = {
  login,
  register,
  logout,
  refreshToken,
  googleSignIn,
  completeGoogleOnboarding,
};

export default authApi;
