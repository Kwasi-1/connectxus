import apiClient from "../lib/apiClient";
import type {
  Assignment,
  Application,
  Earnings,
  AccountDetail,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  CreateApplicationRequest,
  SubmitWorkRequest,
  CompleteAssignmentRequest,
  RequestRefundRequest,
  CreateAccountDetailRequest,
  UpdateAccountDetailRequest,
  AssignmentsResponse,
  ApplicationsResponse,
  AccountDetailsResponse,
} from "../types/assignments";

interface ApiResponse<T> {
  status: string;
  data: T;
}

export const createAssignment = async (
  data: CreateAssignmentRequest
): Promise<Assignment> => {
  const response = await apiClient.post<ApiResponse<Assignment>>(
    "/assignments",
    data
  );
  return response.data.data;
};

export const getAssignmentById = async (id: string): Promise<Assignment> => {
  const response = await apiClient.get<ApiResponse<Assignment>>(
    `/assignments/${id}`
  );
  return response.data.data;
};

export const getAvailableAssignments = async (params?: {
  limit?: number;
  offset?: number;
  subject_type?: string;
  min_price?: number;
  max_price?: number;
  filter_level?: string;
}): Promise<AssignmentsResponse> => {
  const response = await apiClient.get<ApiResponse<AssignmentsResponse>>(
    "/assignments/available",
    { params }
  );
  return response.data.data;
};

export const getMyAssignments = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<AssignmentsResponse> => {
  const response = await apiClient.get<ApiResponse<AssignmentsResponse>>(
    "/assignments/my-assignments",
    { params }
  );
  return response.data.data;
};

export const updateAssignment = async (
  id: string,
  data: UpdateAssignmentRequest
): Promise<Assignment> => {
  const response = await apiClient.patch<ApiResponse<Assignment>>(
    `/assignments/${id}`,
    data
  );
  return response.data.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await apiClient.delete(`/assignments/${id}`);
};

export const getUserEarnings = async (): Promise<Earnings> => {
  const response = await apiClient.get<ApiResponse<Earnings>>(
    "/assignments/earnings"
  );
  return response.data.data;
};

export const getApplicationsByAssignment = async (
  assignmentId: string
): Promise<ApplicationsResponse> => {
  const response = await apiClient.get<ApiResponse<ApplicationsResponse>>(
    `/assignments/${assignmentId}/applications`
  );
  return response.data.data;
};

export const selectHelper = async (
  assignmentId: string,
  applicationId: string
): Promise<Assignment> => {
  const response = await apiClient.post<ApiResponse<Assignment>>(
    `/assignments/${assignmentId}/select-helper/${applicationId}`
  );
  return response.data.data;
};

export const createApplication = async (
  data: CreateApplicationRequest
): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    "/assignments/applications",
    data
  );
  return response.data.data;
};

export const getApplicationById = async (id: string): Promise<Application> => {
  const response = await apiClient.get<ApiResponse<Application>>(
    `/assignments/applications/${id}`
  );
  return response.data.data;
};

export const getMyApplications = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<ApplicationsResponse> => {
  const response = await apiClient.get<ApiResponse<ApplicationsResponse>>(
    "/assignments/applications/my-applications",
    { params }
  );
  return response.data.data;
};

export const acceptApplication = async (id: string): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    `/assignments/applications/${id}/accept`
  );
  return response.data.data;
};

export const rejectApplication = async (id: string): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    `/assignments/applications/${id}/reject`
  );
  return response.data.data;
};

export const submitWork = async (
  id: string,
  data: SubmitWorkRequest
): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    `/assignments/applications/${id}/submit`,
    data
  );
  return response.data.data;
};

export const completeAssignment = async (
  id: string,
  data: CompleteAssignmentRequest
): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    `/assignments/applications/${id}/complete`,
    data
  );
  return response.data.data;
};

export const requestRefund = async (
  id: string,
  data: RequestRefundRequest
): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    `/assignments/applications/${id}/request-refund`,
    data
  );
  return response.data.data;
};

export const createAccountDetail = async (
  data: CreateAccountDetailRequest
): Promise<AccountDetail> => {
  const response = await apiClient.post<ApiResponse<AccountDetail>>(
    "/accounts",
    data
  );
  return response.data.data;
};

export const getMyAccountDetails =
  async (): Promise<AccountDetailsResponse> => {
    const response = await apiClient.get<ApiResponse<AccountDetailsResponse>>(
      "/accounts/my-accounts"
    );
    return response.data.data;
  };

export const getAccountDetailById = async (
  id: string
): Promise<AccountDetail> => {
  const response = await apiClient.get<ApiResponse<AccountDetail>>(
    `/accounts/${id}`
  );
  return response.data.data;
};

export const updateAccountDetail = async (
  id: string,
  data: UpdateAccountDetailRequest
): Promise<AccountDetail> => {
  const response = await apiClient.patch<ApiResponse<AccountDetail>>(
    `/accounts/${id}`,
    data
  );
  return response.data.data;
};

export const deleteAccountDetail = async (id: string): Promise<void> => {
  await apiClient.delete(`/accounts/${id}`);
};

export const requestPayout = async (id: string): Promise<AccountDetail> => {
  const response = await apiClient.post<ApiResponse<AccountDetail>>(
    `/accounts/${id}/request-payout`
  );
  return response.data.data;
};

export interface InitializePaymentResponse {
  authorization_url: string;
  reference: string;
  amount: number;
}

export const initializeAssignmentPayment = async (data: {
  application_id: string;
}): Promise<InitializePaymentResponse> => {
  const response = await apiClient.post<ApiResponse<InitializePaymentResponse>>(
    "/assignments/payments/initialize",
    data
  );
  return response.data.data;
};

export const verifyAssignmentPayment = async (data: {
  reference: string;
}): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    "/assignments/payments/verify",
    data
  );
  return response.data.data;
};
