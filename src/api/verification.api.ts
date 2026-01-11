import apiClient, { setAccessToken, setRefreshToken } from "@/lib/apiClient";
import { User } from "@/api/auth.api";

interface ApiResponse<T> {
  data: T;
}

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  message: string;
  expires_in: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp_code: string;
}

export interface VerifyOTPResponse {
  message: string;
  email_verified: boolean;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: User;
}

export interface ResendOTPRequest {
  email: string;
}

export interface CheckVerificationStatusRequest {
  email: string;
}

export interface CheckVerificationStatusResponse {
  email_verified: boolean;
  user_verified: boolean;
}

export const sendOTP = async (data: SendOTPRequest): Promise<SendOTPResponse> => {
  const response = await apiClient.post<ApiResponse<SendOTPResponse>>(
    "/users/verification/send-otp",
    data
  );
  return response.data.data;
};

export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  const response = await apiClient.post<ApiResponse<VerifyOTPResponse>>(
    "/users/verification/verify-otp",
    data
  );

  const responseData = response.data.data;
  setAccessToken(responseData.access_token);
  setRefreshToken(responseData.refresh_token);

  return responseData;
};

export const resendOTP = async (data: ResendOTPRequest): Promise<SendOTPResponse> => {
  const response = await apiClient.post<ApiResponse<SendOTPResponse>>(
    "/users/verification/resend-otp",
    data
  );
  return response.data.data;
};

export const checkVerificationStatus = async (
  data: CheckVerificationStatusRequest
): Promise<CheckVerificationStatusResponse> => {
  const response = await apiClient.post<ApiResponse<CheckVerificationStatusResponse>>(
    "/users/verification/status",
    data
  );
  return response.data.data;
};

export const verificationApi = {
  sendOTP,
  verifyOTP,
  resendOTP,
  checkVerificationStatus,
};

export default verificationApi;
