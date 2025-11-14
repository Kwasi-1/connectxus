
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserFeed,
  getPostById,
  createPost,
  deletePost,
  toggleLikePost,
  repostPost,
  pinPost,
  getPostComments,
  createComment,
  getTrendingPosts,
  searchPosts,
  getPostsByUser,
  CreatePostRequest,
  CreateCommentRequest,
  PaginationParams,
} from '@/api/posts.api';
import { toast } from 'sonner';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: any) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  feed: (params?: PaginationParams) => [...postKeys.all, 'feed', params] as const,
  trending: (params?: PaginationParams) => [...postKeys.all, 'trending', params] as const,
  byUser: (userId: string, params?: PaginationParams) => [...postKeys.all, 'user', userId, params] as const,
  comments: (postId: string, params?: PaginationParams) => [...postKeys.all, 'comments', postId, params] as const,
  search: (query: string, params?: PaginationParams) => [...postKeys.all, 'search', query, params] as const,
};

export const useUserFeed = (params?: PaginationParams) => {
  return useQuery({
    queryKey: postKeys.feed(params),
    queryFn: () => getUserFeed(params),
  });
};

export const useTrendingPosts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: postKeys.trending(params),
    queryFn: () => getTrendingPosts(params),
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useUserPosts = (userId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: postKeys.byUser(userId, params),
    queryFn: () => getPostsByUser(userId, params),
    enabled: !!userId,
  });
};

export const usePostComments = (postId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: postKeys.comments(postId, params),
    queryFn: () => getPostComments(postId, params),
    enabled: !!postId,
  });
};

export const useSearchPosts = (query: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: postKeys.search(query, params),
    queryFn: () => searchPosts(query, params),
    enabled: !!query && query.length > 0,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.feed() });
      toast.success('Post created successfully!');
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success('Post deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });
};

export const useToggleLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleLikePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

export const useRepost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content?: string }) =>
      repostPost(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success('Post reposted successfully!');
    },
    onError: () => {
      toast.error('Failed to repost');
    },
  });
};

export const usePinPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, pinned }: { postId: string; pinned: boolean }) =>
      pinPost(postId, pinned),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success('Post updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update post');
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CreateCommentRequest }) =>
      createComment(postId, data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      toast.success('Comment added successfully!');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });
};
