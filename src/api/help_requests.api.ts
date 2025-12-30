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

/**
 * Create a new help request
 */
export const createHelpRequest = async (
  data: CreateHelpRequestRequest
): Promise<HelpRequest> => {
  const response = await apiClient.post<ApiResponse<HelpRequest>>(
    "/help-requests",
    data
  );
  return response.data.data;
};

/**
 * Get a specific help request by ID (public)
 */
export const getHelpRequest = async (id: string): Promise<HelpRequest> => {
  const response = await apiClient.get<ApiResponse<HelpRequest>>(
    `/help-requests/${id}`
  );
  return response.data.data;
};

/**
 * Get available help requests (public requests in the same space)
 */
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

/**
 * Get my help requests (requests I created)
 */
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

/**
 * Update a help request
 */
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

/**
 * Delete a help request
 */
export const deleteHelpRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/help-requests/${id}`);
};

/**
 * Toggle help request visibility between public and private
 */
export const toggleHelpRequestVisibility = async (
  id: string
): Promise<HelpRequest> => {
  const response = await apiClient.post<ApiResponse<HelpRequest>>(
    `/help-requests/${id}/toggle-visibility`
  );
  return response.data.data;
};
