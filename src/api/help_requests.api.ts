import apiClient from "../lib/apiClient";
import type {
  HelpRequest,
  CreateHelpRequestRequest,
  UpdateHelpRequestRequest,
  HelpRequestsResponse,
} from "../types/help_requests";

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}


export const createHelpRequest = async (
  data: CreateHelpRequestRequest
): Promise<HelpRequest> => {
  const response = await apiClient.post<ApiResponse<HelpRequest>>(
    "/help-requests",
    data
  );
  return response.data.data;
};


export const getHelpRequest = async (id: string): Promise<HelpRequest> => {
  const response = await apiClient.get<ApiResponse<HelpRequest>>(
    `/help-requests/${id}`
  );
  return response.data.data;
};


export const getAvailableHelpRequests = async (params?: {
  type?: 'course' | 'project' | 'other';
  filter_level?: number;
  level_exact_match?: boolean;
  limit?: number;
  offset?: number;
}): Promise<HelpRequest[]> => {
  const response = await apiClient.get<ApiResponse<HelpRequest[]>>(
    "/help-requests",
    { params }
  );
  return response.data.data;
};


export const getMyHelpRequests = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<HelpRequest[]> => {
  const response = await apiClient.get<ApiResponse<HelpRequest[]>>(
    "/help-requests/my-requests",
    { params }
  );
  return response.data.data;
};


export const updateHelpRequest = async (
  id: string,
  data: UpdateHelpRequestRequest
): Promise<HelpRequest> => {
  const response = await apiClient.put<ApiResponse<HelpRequest>>(
    `/help-requests/${id}`,
    data
  );
  return response.data.data;
};


export const deleteHelpRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/help-requests/${id}`);
};


export const toggleHelpRequestVisibility = async (
  id: string
): Promise<HelpRequest> => {
  const response = await apiClient.post<ApiResponse<HelpRequest>>(
    `/help-requests/${id}/toggle-visibility`
  );
  return response.data.data;
};
