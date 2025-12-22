import apiClient from "@/lib/apiClient";

interface ApiResponse<T> {
  data: T;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetResponse {
  message: string;
  expires_in: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const requestPasswordReset = async (
  data: RequestPasswordResetRequest
): Promise<RequestPasswordResetResponse> => {
  const response = await apiClient.post<ApiResponse<RequestPasswordResetResponse>>(
    "/users/password/request-reset",
    data
  );
  return response.data.data;
};

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ApiResponse<ResetPasswordResponse>>(
    "/users/password/reset",
    data
  );
  return response.data.data;
};

export const passwordApi = {
  requestPasswordReset,
  resetPassword,
};

export default passwordApi;
