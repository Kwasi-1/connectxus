
import apiClient from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface Report {
  id: string;
  reason: string;
  description?: string;
  content_id: string;
  content_type: 'post' | 'comment' | 'user';
  reporter_id: string;
  status: 'pending' | 'approved' | 'removed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface CreateReportRequest {
  reason: string;
  description?: string;
  content_id: string;
  content_type: 'post' | 'comment' | 'user';
}

export interface SystemMetrics {
  total_users: number;
  active_users: number;
  total_posts: number;
  total_groups: number;
  total_events: number;
  reported_content: number;
  pending_applications: number;
  system_health: string;
  last_updated: string;
}


export const getReport = async (reportId: string): Promise<Report> => {
  const response = await apiClient.get<ApiResponse<Report>>(`/analytics/reports/${reportId}`);
  return response.data.data;
};

export const getReportsByContent = async (
  contentId: string,
  contentType: string
): Promise<Report[]> => {
  const response = await apiClient.get<ApiResponse<Report[]>>('/analytics/reports/by-content', {
    params: { content_id: contentId, content_type: contentType },
  });
  return response.data.data;
};

export const getPendingReports = async (): Promise<Report[]> => {
  const response = await apiClient.get<ApiResponse<Report[]>>('/analytics/reports/pending');
  return response.data.data;
};

export const createReport = async (data: CreateReportRequest): Promise<Report> => {
  const response = await apiClient.post<ApiResponse<Report>>('/analytics/reports', data);
  return response.data.data;
};

export const updateReport = async (reportId: string, data: Partial<Report>): Promise<Report> => {
  const response = await apiClient.put<ApiResponse<Report>>(`/analytics/reports/${reportId}`, data);
  return response.data.data;
};


export const getModerationQueue = async (): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/analytics/moderation/queue');
  return response.data.data;
};

export const getModerationStats = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/analytics/moderation/stats');
  return response.data.data;
};


export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const response = await apiClient.get<ApiResponse<SystemMetrics>>('/analytics/metrics/system');
  return response.data.data;
};

export const getSpaceMetrics = async (spaceId?: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/analytics/metrics/space', {
    params: spaceId ? { space_id: spaceId } : {},
  });
  return response.data.data;
};

export const getHistoricalMetrics = async (params?: any): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/analytics/metrics/historical', { params });
  return response.data.data;
};


export const getEngagementMetrics = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/analytics/engagement/metrics');
  return response.data.data;
};

export const getActivityStats = async (params?: any): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/analytics/activity/stats', { params });
  return response.data.data;
};


export const getUserGrowthStats = async (params?: any): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/analytics/users/growth', { params });
  return response.data.data;
};

export const getUserRanking = async (params?: any): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/analytics/users/ranking', { params });
  return response.data.data;
};


export const getTopPosts = async (params?: any): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/analytics/top/posts', { params });
  return response.data.data;
};

export const getTopCommunities = async (params?: any): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/analytics/top/communities', { params });
  return response.data.data;
};

export const getTopGroups = async (params?: any): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/analytics/top/groups', { params });
  return response.data.data;
};


export const getMentoringAnalytics = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/analytics/mentorship/mentoring');
  return response.data.data;
};

export const getTutoringAnalytics = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/analytics/mentorship/tutoring');
  return response.data.data;
};

export const getPopularMentorIndustries = async (): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/analytics/mentorship/industries');
  return response.data.data;
};

export const getPopularTutorSubjects = async (): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/analytics/mentorship/subjects');
  return response.data.data;
};

export const analyticsApi = {
    getReport,
  getReportsByContent,
  getPendingReports,
  createReport,
  updateReport,
    getModerationQueue,
  getModerationStats,
    getSystemMetrics,
  getSpaceMetrics,
  getHistoricalMetrics,
    getEngagementMetrics,
  getActivityStats,
    getUserGrowthStats,
  getUserRanking,
    getTopPosts,
  getTopCommunities,
  getTopGroups,
    getMentoringAnalytics,
  getTutoringAnalytics,
  getPopularMentorIndustries,
  getPopularTutorSubjects,
};

export default analyticsApi;
