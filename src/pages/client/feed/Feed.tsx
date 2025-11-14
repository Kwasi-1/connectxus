
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Feed as FeedComponent } from '@/components/feed/Feed';
import { FullScreenPostModal } from '@/components/feed/FullScreenPostModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserFeed, createPost, toggleLikePost, repostPost } from '@/api/posts.api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Author {
  id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  verified?: boolean;
}

interface Post {
  id: string;
  author_id: string;
  content: string;
  media?: any;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  is_liked?: boolean;
  is_pinned: boolean;
  created_at: string;
  author?: Author;
  quoted_post?: Post | null;
}

const Feed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getUserFeed({ page: 1, limit: 50 }),
    staleTime: 30000,   });

    const createPostMutation = useMutation({
    mutationFn: (data: { content: string; visibility?: string }) =>
      createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

    const likeMutation = useMutation({
    mutationFn: (postId: string) => toggleLikePost(postId),
    onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

      queryClient.setQueryData<Post[]>(['posts'], (old) =>
        old?.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: !post.is_liked,
                likes_count: post.is_liked
                  ? post.likes_count - 1
                  : post.likes_count + 1,
              }
            : post
        )
      );

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(['posts'], context?.previousPosts);
      toast.error('Failed to like post');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

    const repostMutation = useMutation({
    mutationFn: (postId: string) => repostPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post reposted!');
    },
    onError: () => {
      toast.error('Failed to repost');
    },
  });

  const handleCreatePost = (content: string, audience?: string) => {
    createPostMutation.mutate({
      content,
      visibility: audience === 'Public' ? 'public' : 'followers'
    });
  };

  const handleQuote = (content: string, quotedPost: any) => {
    createPostMutation.mutate({
      content,
            quoted_post_id: quotedPost.id,
    });
  };

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleComment = (postId: string) => {
        window.location.href = `/post/${postId}`;
  };

  const handleRepost = (postId: string) => {
    repostMutation.mutate(postId);
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleMediaClick = (post: any) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

    const transformedPosts = posts.map((post) => ({
    id: post.id,
    author: {
      id: post.author_id,
      username: post.username || 'Unknown',
      name: post.full_name || 'Unknown User',
      verified: post.author_verified || false,
      avatar: post.author_avatar || undefined,
    },
    content: post.content,
    media: post.media ? [post.media] : undefined,
    likes: post.likes_count,
    comments: post.comments_count,
    reposts: post.reposts_count,
    quotes: post.quotes_count || 0,
    isLiked: post.is_liked || false,
    isReposted: false,     createdAt: new Date(post.created_at),
    quotedPost: post.quoted_post ? {
      id: post.quoted_post.id,
      author: {
        id: post.quoted_post.author_id,
        username: post.quoted_username || 'Unknown',
        name: post.quoted_full_name || 'Unknown User',
        verified: post.quoted_post.author_verified || false,
        avatar: post.quoted_post.author_avatar || undefined,
      },
      content: post.quoted_content || '',
      createdAt: new Date(post.quoted_post.created_at),
      likes: post.quoted_post.likes_count,
      comments: post.quoted_post.comments_count,
      reposts: post.quoted_post.reposts_count,
      quotes: post.quoted_post.quotes_count || 0,
      isLiked: false,
      isReposted: false,
    } : undefined,
  }));

  return (
    <>
      <AppLayout onCreatePost={handleCreatePost}>
        <FeedComponent
          posts={transformedPosts}
          onCreatePost={handleCreatePost}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onQuote={handleQuote}
          onShare={handleShare}
          onMediaClick={handleMediaClick}
          loading={loading}
        />
      </AppLayout>

      {selectedPost && (
        <FullScreenPostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          post={transformedPosts.find(p => p.id === selectedPost.id)!}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onQuote={handleQuote}
          onShare={handleShare}
        />
      )}
    </>
  );
};

export default Feed;
