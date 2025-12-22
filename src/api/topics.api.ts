
import apiClient from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  posts_count: number;
  trend_score: number;
}

export interface TrendingTopicsParams extends PaginationParams {
  timeframe?: '24h' | '7d' | '30d'; }

export const getTrendingTopics = async (params?: TrendingTopicsParams): Promise<TrendingTopic[]> => {
  const response = await apiClient.get<ApiResponse<TrendingTopic[]>>('/topics/trending', {
    params,
  });
  return response.data.data;
};

export const topicsApi = {
  getTrendingTopics,
};

export default topicsApi;
