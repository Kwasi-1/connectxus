
import apiClient, { getDefaultSpaceId } from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface Post {
  id: string;
  space_id: string;
  author_id: string;
  community_id?: string | null;
  group_id?: string | null;
  parent_post_id?: string | null;
  quoted_post_id?: string | null;
  content: string;
  media?: any | null;             tags?: string[] | null;
  visibility?: string | null;     likes_count: number;
  comments_count: number;
  reposts_count: number;
  quotes_count?: number;
  is_pinned: boolean;
  created_at: string;
  updated_at?: string | null;
    username?: string;
  full_name?: string;
  author_avatar?: string | null;
  author_verified?: boolean | null;
  author?: any;                   is_liked?: boolean;
  quoted_post?: Post | null;
    quoted_username?: string;
  quoted_full_name?: string;
  quoted_content?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at?: string | null;
  author?: any;                   is_liked?: boolean;
}

export interface CreatePostRequest {
  space_id: string;
  community_id?: string | null;
  group_id?: string | null;
  parent_post_id?: string | null;
  quoted_post_id?: string | null;
  content: string;                media?: any | null;             tags?: string[];
  visibility?: 'public' | 'followers' | 'private';
}

export interface CreateCommentRequest {
  parent_comment_id?: string | null;
  content: string;              }

export const getPostById = async (postId: string): Promise<Post> => {
  const response = await apiClient.get<ApiResponse<Post>>(`/posts/${postId}`);
  return response.data.data;
};

export const createPost = async (data: Omit<CreatePostRequest, 'space_id'>): Promise<Post> => {
  const spaceId = getDefaultSpaceId();

  if (!spaceId) {
    throw new Error('Space ID is required. Please configure VITE_DEFAULT_SPACE_ID.');
  }

  const requestData: CreatePostRequest = {
    ...data,
    space_id: spaceId,
  };

  const response = await apiClient.post<ApiResponse<Post>>('/posts', requestData);
  return response.data.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/posts/${postId}`);
};

export const getUserFeed = async (params?: PaginationParams): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>('/posts/feed', { params });
  return response.data.data;
};

export const getPostsByUser = async (
  userId: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(`/posts/user/${userId}`, { params });
  return response.data.data;
};

export const getPostsByCommunity = async (
  communityId: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    `/posts/community/${communityId}`,
    { params }
  );
  return response.data.data;
};

export const getPostsByGroup = async (
  groupId: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    `/posts/group/${groupId}`,
    { params }
  );
  return response.data.data;
};

export const getTrendingPosts = async (params?: PaginationParams): Promise<Post[]> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<Post[]>>('/posts/trending', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getLikedPosts = async (params?: PaginationParams): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>('/posts/liked', { params });
  return response.data.data;
};

export const searchPosts = async (
  query: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<Post[]>>('/posts/search', {
    params: { q: query, space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const advancedSearchPosts = async (filters: any): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>('/posts/advanced-search', {
    params: filters,
  });
  return response.data.data;
};

export const toggleLikePost = async (postId: string): Promise<{ likes_count: number }> => {
  const response = await apiClient.post<ApiResponse<{ likes_count: number }>>(
    `/posts/${postId}/like`
  );
  return response.data.data;
};

export const repostPost = async (postId: string, content?: string): Promise<Post> => {
  const response = await apiClient.post<ApiResponse<Post>>(
    `/posts/${postId}/repost`,
    { content }
  );
  return response.data.data;
};

export const pinPost = async (postId: string, pinned: boolean): Promise<Post> => {
  const response = await apiClient.put<ApiResponse<Post>>(
    `/posts/${postId}/pin`,
    { is_pinned: pinned }
  );
  return response.data.data;
};

export const getPostComments = async (
  postId: string,
  params?: PaginationParams
): Promise<Comment[]> => {
  const response = await apiClient.get<ApiResponse<Comment[]>>(
    `/posts/${postId}/comments`,
    { params }
  );
  return response.data.data;
};

export const createComment = async (
  postId: string,
  data: CreateCommentRequest
): Promise<Comment> => {
  const response = await apiClient.post<ApiResponse<Comment>>(
    `/posts/${postId}/comments`,
    data
  );
  return response.data.data;
};

export const toggleLikeComment = async (commentId: string): Promise<{ liked: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ liked: boolean }>>(
    `/comments/${commentId}/like`
  );
  return response.data.data;
};

export const getPostLikes = async (
  postId: string,
  params?: PaginationParams
): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/posts/${postId}/likes`,
    { params }
  );
  return response.data.data;
};

export const postsApi = {
  getPostById,
  createPost,
  deletePost,
  getUserFeed,
  getPostsByUser,
  getPostsByCommunity,
  getPostsByGroup,
  getTrendingPosts,
  getLikedPosts,
  searchPosts,
  advancedSearchPosts,
  toggleLikePost,
  repostPost,
  pinPost,
  getPostComments,
  createComment,
  toggleLikeComment,
  getPostLikes,
};

export default postsApi;
