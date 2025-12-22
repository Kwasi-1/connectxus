import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedLoadingSkeleton } from '@/components/feed/PostCardSkeleton';
import { FullScreenPostModal } from '@/components/feed/FullScreenPostModal';
import { RepostModal } from '@/components/feed/RepostModal';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useFeed } from '@/hooks/useFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { createPost } from '@/api/posts.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FeedTab, FeedPost } from '@/types/feed';

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<FeedTab>('following');
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [postForRepost, setPostForRepost] = useState<FeedPost | null>(null);

  const {
    posts,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    likePost,
    repostPost,
    deletePost,
    sharePost,
  } = useFeed({
    type: 'home',
    tab: activeTab,
  });

  const { loadMoreRef } = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasMore: hasNextPage || false,
    onLoadMore: fetchNextPage,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; media?: string[] | null; visibility?: string; quoted_post_id?: string }) =>
      createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed', activeTab],
        refetchType: 'active' 
      });
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  const handleCreatePost = (content: string, mediaUrls?: string[]) => {
    createPostMutation.mutate({
      content,
      media: mediaUrls && mediaUrls.length > 0 ? mediaUrls : null,
      visibility: 'public',
    });
  };

  const handleLike = (postId: string) => {
    likePost(postId);
  };

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setPostForRepost(post);
      setIsRepostModalOpen(true);
    }
  };

  const handleRepostConfirm = (postId: string) => {
    repostPost(postId);
  };


  const handleShare = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    sharePost(postId, post?.content);
  };

  const handleMediaClick = (post: FeedPost) => {
    setSelectedPost(post);
    setIsMediaModalOpen(true);
  };

  const handleMobilePostClick = () => {
    navigate('/compose');
  };

  const handleTabChange = (tab: 'following' | 'university') => {
    setActiveTab(tab);
  };


  return (
    <>
      <AppLayout onCreatePost={handleCreatePost}>
        <div className="flex-1 border-l xl:border-l-0 border-r border-border">
          <FeedHeader activeFilter={activeTab} onFilterChange={handleTabChange} />

          <div className='min-h-screen'>
            <PostComposer onPost={handleCreatePost} />

            {isLoading ? (
              <FeedLoadingSkeleton count={5} />
            ) : (
              <>
                <div className="divide-y divide-border">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                    />
                  ))}

                  {posts.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No posts found. Start following people or create your first post!
                      </p>
                    </div>
                  )}
                </div>

                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="py-4 text-center">
                    {isFetchingNextPage && <FeedLoadingSkeleton count={2} />}
                  </div>
                )}

                {!hasNextPage && posts.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            )}
          </div>

          <FloatingActionButton onClick={handleMobilePostClick} />
        </div>
      </AppLayout>

      {/* Media modal */}
      {selectedPost && (
        <FullScreenPostModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          post={selectedPost as any}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onShare={handleShare}
        />
      )}

      {/* Repost modal */}
      {postForRepost && (
        <RepostModal
          isOpen={isRepostModalOpen}
          onClose={() => {
            setIsRepostModalOpen(false);
            setPostForRepost(null);
          }}
          post={postForRepost as any}
          onRepost={handleRepostConfirm}
          isReposted={postForRepost.is_reposted}
        />
      )}

    </>
  );
};


export default Feed;
