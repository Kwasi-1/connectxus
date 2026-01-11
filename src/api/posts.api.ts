import apiClient from "@/lib/apiClient";

interface ApiResponse<T> {
  data: T;
}

const transformPost = (apiPost: any): Post => {
  if (apiPost.author && typeof apiPost.author === "object") {
    return apiPost;
  }

  return {
    ...apiPost,
    author: {
      id: apiPost.author_id,
      username: apiPost.username || "user",
      full_name: apiPost.full_name || "User",
      avatar: apiPost.author_avatar,
      verified: apiPost.author_verified || false,
    },
    images: apiPost.media || apiPost.images,
    quoted_post: apiPost.quoted_post
      ? transformPost(apiPost.quoted_post)
      : null,
  };
};

const transformPosts = (posts: any[]): Post[] => {
  return posts.map(transformPost);
};

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface Post {
  id: string;
  space_id: string;
  author_id: string;
  community_id?: string | null;
  group_id?: string | null;
  parent_post_id?: string | null;
  quoted_post_id?: string | null;
  content: string;
  media?: string[] | null;
  images?: string[];
  video?: string;
  tags?: string[] | null;
  visibility?: string | null;
  likes_count: number;
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
  author?: any;
  is_liked?: boolean;
  is_reposted?: boolean;
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
  author?: any;
  is_liked?: boolean;
}

export interface CreatePostRequest {
  space_id?: string;
  community_id?: string | null;
  group_id?: string | null;
  parent_post_id?: string | null;
  quoted_post_id?: string | null;
  content: string;
  media?: string[] | null;
  tags?: string[];
  visibility?: "public" | "private" | "community" | "group";
}

export interface CreateCommentRequest {
  parent_comment_id?: string | null;
  content: string;
}

export const getPostById = async (postId: string): Promise<Post> => {
  const response = await apiClient.get<ApiResponse<Post>>(`/posts/${postId}`);
  return transformPost(response.data.data);
};

export const createPost = async (
  data: Omit<CreatePostRequest, "space_id">
): Promise<Post> => {
  const response = await apiClient.post<ApiResponse<Post>>("/posts", data);
  return transformPost(response.data.data);
};

export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/posts/${postId}`);
};

export const getUserFeed = async (
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>("/posts/feed", {
    params,
  });
  return transformPosts(response.data.data);
};

export const getFollowingFeed = async (
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    "/posts/feed/for-you",
    { params }
  );
  return transformPosts(response.data.data);
};

export const getUniversityFeed = async (
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    "/posts/feed/university",
    { params }
  );
  return transformPosts(response.data.data);
};

export const getPostsByUser = async (
  userId: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    `/posts/user/${userId}`,
    { params }
  );
  return transformPosts(response.data.data);
};

export const getPostsByUsername = async (
  username: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    `/posts/username/${username}`,
    { params }
  );
  return transformPosts(response.data.data);
};

export const getPostsByCommunity = async (
  communityId: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    `/posts/community/${communityId}`,
    { params }
  );
  return transformPosts(response.data.data);
};

export const getPostsByGroup = async (
  groupId: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    `/posts/group/${groupId}`,
    { params }
  );
  return transformPosts(response.data.data);
};

export const getTrendingPosts = async (
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>("/posts/trending", {
    params,
  });
  return transformPosts(response.data.data);
};

export const getLikedPosts = async (
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>("/posts/liked", {
    params,
  });
  return transformPosts(response.data.data);
};

export const searchPosts = async (
  query: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>("/posts/search", {
    params: { q: query, ...params },
  });
  return transformPosts(response.data.data);
};

export const advancedSearchPosts = async (filters: any): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    "/posts/advanced-search",
    {
      params: filters,
    }
  );
  return transformPosts(response.data.data);
};

export const toggleLikePost = async (
  postId: string
): Promise<{ likes_count: number }> => {
  const response = await apiClient.post<ApiResponse<{ likes_count: number }>>(
    `/posts/${postId}/like`
  );
  return response.data.data;
};

export const repostPost = async (
  postId: string,
  content?: string
): Promise<{ reposts_count?: number } | Post> => {
  const response = await apiClient.post<
    ApiResponse<{ reposts_count?: number } | Post>
  >(`/posts/${postId}/repost`, content ? { content } : {});
  const data = response.data.data;
  if (data && typeof data === "object" && "id" in data) {
    return transformPost(data as any);
  }
  return data;
};

export const pinPost = async (
  postId: string,
  pinned: boolean
): Promise<Post> => {
  const response = await apiClient.put<ApiResponse<Post>>(
    `/posts/${postId}/pin`,
    { is_pinned: pinned }
  );
  return transformPost(response.data.data);
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

export const getPostCommentsPaginated = async (
  postId: string,
  params?: PaginationParams
): Promise<Comment[]> => {
  const response = await apiClient.get<ApiResponse<Comment[]>>(
    `/posts/${postId}/comments/paginated`,
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

export const toggleLikeComment = async (
  commentId: string
): Promise<{ likes_count: number }> => {
  const response = await apiClient.post<ApiResponse<{ likes_count: number }>>(
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

export const getPostLikesPaginated = async (
  postId: string,
  params?: PaginationParams
): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/posts/${postId}/likes/paginated`,
    { params }
  );
  return response.data.data;
};

export const getPostQuotesPaginated = async (
  postId: string,
  params?: PaginationParams
): Promise<Post[]> => {
  const response = await apiClient.get<ApiResponse<Post[]>>(
    `/posts/${postId}/quotes/paginated`,
    { params }
  );
  return transformPosts(response.data.data);
};

export interface UserRepost {
  id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  verified: boolean;
  reposted_at?: string;
  is_following?: boolean;
}

export const getPostRepostsPaginated = async (
  postId: string,
  params?: PaginationParams
): Promise<UserRepost[]> => {
  const response = await apiClient.get<ApiResponse<UserRepost[]>>(
    `/posts/${postId}/reposts/paginated`,
    { params }
  );
  return response.data.data;
};

export interface ReportPostRequest {
  reason: string;
  description?: string;
  priority?: string;
}

export const reportPost = async (
  postId: string,
  data: ReportPostRequest
): Promise<void> => {
  await apiClient.post(`/posts/${postId}/report`, data);
};

export const postsApi = {
  getPostById,
  createPost,
  deletePost,
  getUserFeed,
  getFollowingFeed,
  getUniversityFeed,
  getPostsByUser,
  getPostsByUsername,
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
  getPostCommentsPaginated,
  createComment,
  toggleLikeComment,
  getPostLikes,
  getPostLikesPaginated,
  getPostQuotesPaginated,
  getPostRepostsPaginated,
  reportPost,
};

export default postsApi;
