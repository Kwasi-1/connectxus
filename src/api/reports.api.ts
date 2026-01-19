import apiClient from "@/lib/apiClient";

export interface CreateReportRequest {
  reason: string;
  description: string;
}

export interface ReportResponse {
  data: {
    id: string;
    message: string;
  };
}

export const reportPost = async (
  postId: string,
  data: CreateReportRequest
): Promise<ReportResponse> => {
  const response = await apiClient.post(`/reports/posts/${postId}`, data);
  return response.data;
};

export const reportComment = async (
  commentId: string,
  data: CreateReportRequest
): Promise<ReportResponse> => {
  const response = await apiClient.post(`/reports/comments/${commentId}`, data);
  return response.data;
};

export const reportMessage = async (
  messageId: string,
  data: CreateReportRequest
): Promise<ReportResponse> => {
  const response = await apiClient.post(`/reports/messages/${messageId}`, data);
  return response.data;
};

export const reportUser = async (
  userId: string,
  data: CreateReportRequest
): Promise<ReportResponse> => {
  const response = await apiClient.post(`/reports/users/${userId}`, data);
  return response.data;
};
