import { useState, useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserFeed,
  getFollowingFeed,
  getUniversityFeed,
  getPostsByUser,
  getPostsByCommunity,
  getPostsByGroup,
  getLikedPosts,
  getTrendingPosts,
  toggleLikePost,
  repostPost,
  deletePost as apiDeletePost,
} from '@/api/posts.api';
import type { FeedPost, FeedType, FeedTab, FeedFilters, FeedPaginationParams } from '@/types/feed';
import { toast } from 'sonner';

interface UseFeedOptions {
  type: FeedType;
  tab?: FeedTab;
  userId?: string;
  communityId?: string;
  groupId?: string;
  enabled?: boolean;
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 20;

export function useFeed(options: UseFeedOptions) {
  const {
    type,
    tab = 'following',
    userId,
    communityId,
    groupId,
    enabled = true,
    itemsPerPage = ITEMS_PER_PAGE
  } = options;

  const queryClient = useQueryClient();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getQueryKey = () => {
    switch (type) {
      case 'home':
        return ['feed', tab];
      case 'user':
        return ['user-posts', userId];
      case 'community':
        return ['community-posts', communityId];
      case 'group':
        return ['group-posts', groupId];
      case 'liked':
        return ['liked-posts', userId];
      case 'trending':
        return ['trending-posts'];
      default:
        return ['feed', 'following'];
    }
  };

  const fetchFeed = async ({ pageParam = 1 }: { pageParam?: number }) => {
    if (pageParam === 1) {
      seenIdsRef.current.clear();
    }

    const emptyResult = {
      posts: [] as FeedPost[],
      nextPage: undefined as number | undefined,
      hasMore: false
    };

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const params: FeedPaginationParams = {
        page: pageParam,
        limit: itemsPerPage * 2,
      };

      let posts: FeedPost[] = [];

      try {
        switch (type) {
          case 'home':
            switch (tab) {
              case 'following':
                posts = await getFollowingFeed(params);
                break;
              case 'university':
                posts = await getUniversityFeed(params);
                break;
              default:
                posts = await getFollowingFeed(params);
            }
            break;
          case 'user':
            if (!userId) {
              console.warn('User ID required for user feed');
              return emptyResult;
            }
            posts = await getPostsByUser(userId, params);
            break;
          case 'community':
            if (!communityId) {
              console.warn('Community ID required for community feed');
              return emptyResult;
            }
            posts = await getPostsByCommunity(communityId, params);
            break;
          case 'group':
            if (!groupId) {
              console.warn('Group ID required for group feed');
              return emptyResult;
            }
            posts = await getPostsByGroup(groupId, params);
            break;
          case 'liked':
            posts = await getLikedPosts(params);
            break;
          case 'trending':
            posts = await getTrendingPosts(params);
            break;
          default:
            posts = await getForYouFeed(params);
        }

        if (!Array.isArray(posts)) {
          console.warn('API returned non-array posts, defaulting to empty array:', posts);
          posts = [];
        }

        posts = posts.filter(post => post != null);

        posts = shuffleArray(posts);

        const uniquePosts = posts.filter(post => post && post.id && !seenIdsRef.current.has(post.id));

        const newIds = uniquePosts.map(p => p?.id).filter(Boolean);
        newIds.forEach(id => {
          if (id) seenIdsRef.current.add(id);
        });

        return {
          posts: uniquePosts,
          nextPage: uniquePosts.length >= itemsPerPage ? pageParam + 1 : undefined,
          hasMore: uniquePosts.length >= itemsPerPage,
        };
      } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          return emptyResult;
        }
        console.error('Error fetching feed:', error);
        return emptyResult;
      }
    } catch (outerError: any) {
      console.error('Unexpected error in fetchFeed:', outerError);
      return emptyResult;
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: getQueryKey(),
    queryFn: fetchFeed,
    getNextPageParam: (lastPage, allPages) => {
      try {
        if (!lastPage) {
          console.debug('getNextPageParam: lastPage is null/undefined');
          return undefined;
        }

        if (typeof lastPage !== 'object') {
          console.warn('getNextPageParam: lastPage is not an object', typeof lastPage);
          return undefined;
        }

        if (!('nextPage' in lastPage)) {
          console.debug('getNextPageParam: nextPage property not found');
          return undefined;
        }

        if (!('posts' in lastPage)) {
          console.warn('getNextPageParam: posts property not found');
          return undefined;
        }

        if (!('hasMore' in lastPage)) {
          console.debug('getNextPageParam: hasMore property not found');
          return undefined;
        }

        if (!lastPage.hasMore) {
          console.debug('getNextPageParam: no more pages');
          return undefined;
        }

        if (!lastPage.nextPage) {
          console.debug('getNextPageParam: nextPage is null/undefined');
          return undefined;
        }

        console.debug('getNextPageParam: returning nextPage', lastPage.nextPage);
        return lastPage.nextPage;
      } catch (e) {
        console.error('Error in getNextPageParam:', e);
        return undefined;
      }
    },
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000, 
    gcTime: 30 * 60 * 1000, 
    retry: false, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false, 
    refetchOnReconnect: false, 
    
    throwOnError: false,
  });

  
  const posts = data?.pages?.flatMap(page => {
    
    if (!page || typeof page !== 'object') return [];
    if (!('posts' in page)) return [];
    if (!Array.isArray(page.posts)) return [];
    return page.posts;
  }) ?? [];

  
  const handleRefresh = useCallback(() => {
    seenIdsRef.current.clear();
    refetch();
  }, [refetch]);

  
  const likeMutation = useMutation({
    mutationFn: (postId: string) => toggleLikePost(postId),
    onMutate: async (postId) => {
      
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['user-posts'] });
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      await queryClient.cancelQueries({ queryKey: ['group-posts'] });
      await queryClient.cancelQueries({ queryKey: ['liked-posts'] });
      await queryClient.cancelQueries({ queryKey: ['trending-posts'] });

      
      const previousData = queryClient.getQueryData(getQueryKey());

      
      const updatePostLike = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: FeedPost) =>
              post.id === postId
                ? {
                    ...post,
                    is_liked: !post.is_liked,
                    likes_count: post.is_liked
                      ? Math.max(0, post.likes_count - 1)
                      : post.likes_count + 1,
                  }
                : post
            ),
          })),
        };
      };

      
      queryClient.setQueriesData({ queryKey: ['feed'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['user-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['community-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['group-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['liked-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['trending-posts'] }, updatePostLike);

      return { previousData };
    },
    onError: (err, postId, context) => {
      
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(), context.previousData);
      }
      toast.error('Failed to like post');
    },
    onSuccess: () => {
      
      
    },
  });

  
  const repostMutation = useMutation({
    mutationFn: (postId: string) => repostPost(postId),
    onMutate: async (postId) => {
      
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['user-posts'] });
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      await queryClient.cancelQueries({ queryKey: ['group-posts'] });
      await queryClient.cancelQueries({ queryKey: ['trending-posts'] });

      const previousData = queryClient.getQueryData(getQueryKey());

      
      let wasReposted = false;

      
      const updatePostRepost = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: FeedPost) => {
              if (post.id === postId) {
                wasReposted = post.is_reposted || false;
                return {
                  ...post,
                  is_reposted: !post.is_reposted,
                  reposts_count: post.is_reposted
                    ? Math.max(0, post.reposts_count - 1)
                    : post.reposts_count + 1,
                };
              }
              return post;
            }),
          })),
        };
      };

      
      queryClient.setQueriesData({ queryKey: ['feed'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['user-posts'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['community-posts'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['group-posts'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['trending-posts'] }, updatePostRepost);

      return { previousData, wasReposted };
    },
    onSuccess: (data, variables, context) => {
      toast.success(context?.wasReposted ? 'Repost undone' : 'Post reposted!');
    },
    onError: (err, postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(), context.previousData);
      }
      toast.error('Failed to repost');
    },
    onSettled: () => {
      
    },
  });

  
  const deleteMutation = useMutation({
    mutationFn: (postId: string) => apiDeletePost(postId),
    onMutate: async (postId) => {
      
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['user-posts'] });
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      await queryClient.cancelQueries({ queryKey: ['group-posts'] });
      await queryClient.cancelQueries({ queryKey: ['liked-posts'] });
      await queryClient.cancelQueries({ queryKey: ['trending-posts'] });

      const previousData = queryClient.getQueryData(getQueryKey());

      
      const removePost = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((post: FeedPost) => post.id !== postId),
          })),
        };
      };

      
      queryClient.setQueriesData({ queryKey: ['feed'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['user-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['community-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['group-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['liked-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['trending-posts'] }, removePost);

      
      seenIdsRef.current.delete(postId);

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Post deleted');
    },
    onError: (err, postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(), context.previousData);
      }
      toast.error('Failed to delete post');
    },
    onSettled: () => {
      
    },
  });

  
  const sharePost = useCallback(async (postId: string, postContent?: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    const shareData = {
      title: 'Check out this post',
      text: postContent ? `${postContent.substring(0, 100)}...` : 'Check out this post on Campus Connect',
      url: shareUrl,
    };

    try {
      
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        
      } else {
        
        await navigator.clipboard.writeText(shareUrl);
        
      }
    } catch (error: any) {
      
      if (error.name !== 'AbortError') {
        
        try {
          await navigator.clipboard.writeText(shareUrl);
          
        } catch {
          
          console.error('Failed to share:', error);
        }
      }
    }
  }, []);

  return {
    posts,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch: handleRefresh,
    
    likePost: likeMutation.mutate,
    repostPost: repostMutation.mutate,
    deletePost: deleteMutation.mutate,
    sharePost,
    
    isLiking: likeMutation.isPending,
    isReposting: repostMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}