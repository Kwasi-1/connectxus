import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostCard } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { FeedLoadingSkeleton } from "@/components/feed/PostCardSkeleton";
import { FullScreenPostModal } from "@/components/feed/FullScreenPostModal";
import { RepostModal } from "@/components/feed/RepostModal";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { NewStoriesList } from "@/components/story/NewStoriesList";
import { NewStoryViewer } from "@/components/story/NewStoryViewer";
import { NewStoryModal } from "@/components/story/NewStoryModal";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useFeed } from "@/hooks/useFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { createPost } from "@/api/posts.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FeedTab, FeedPost } from "@/types/feed";
import { useStories } from "@/hooks/useStories";
import type { StoryData } from "@/types/storyTypes";

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const [activeTab, setActiveTab] = useState<FeedTab>("following");
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [postForRepost, setPostForRepost] = useState<FeedPost | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(
    null,
  );
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState<any>(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number>(0);

  const { groupedStories, isLoading: storiesLoading } = useStories();

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
    type: "home",
    tab: activeTab,
  });

  const { loadMoreRef } = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasMore: hasNextPage || false,
    onLoadMore: fetchNextPage,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: {
      content: string;
      media?: string[] | null;
      visibility?: string;
      quoted_post_id?: string;
    }) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed", activeTab],
        refetchType: "active",
      });
      toast.success("Post created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const handleCreatePost = (content: string, mediaUrls?: string[]) => {
    createPostMutation.mutate({
      content,
      media: mediaUrls && mediaUrls.length > 0 ? mediaUrls : null,
      visibility: "public",
    });
  };

  const handleLike = (postId: string) => {
    likePost(postId);
  };

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setPostForRepost(post);
      setIsRepostModalOpen(true);
    }
  };

  const handleRepostConfirm = (postId: string) => {
    repostPost(postId);
  };

  const handleQuote = (postId: string) => {
    navigate("/compose", { state: { quotedPostId: postId } });
  };

  const handleViewInteractions = (postId: string) => {
    navigate(`/post/${postId}/interactions`);
  };

  const handleShare = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    sharePost(postId, post?.content);
  };

  const handleMediaClick = (post: FeedPost) => {
    setSelectedPost(post);
    setIsMediaModalOpen(true);
  };

  const handleMobilePostClick = () => {
    navigate("/compose");
  };

  const handleTabChange = (tab: "following" | "university") => {
    setActiveTab(tab);
  };

  const handleStoryClick = (userStories: any, storyIndex: number) => {
    const userIndex = groupedStories.findIndex(
      (group) => group.user_id === userStories.user_id,
    );
    setSelectedUserStories(userStories);
    setSelectedStoryIndex(storyIndex);
    setSelectedUserIndex(userIndex >= 0 ? userIndex : 0);
    setIsStoryViewerOpen(true);
  };

  const handleAddStory = () => {
    setIsAddStoryModalOpen(true);
  };

  return (
    <>
      <AppLayout onCreatePost={handleCreatePost}>
        <div className="flex-1 border-x-0 xl:border-l-0 xl:border-r border-border">
          <FeedHeader
            activeFilter={activeTab}
            onFilterChange={handleTabChange}
          />

          <NewStoriesList
            groupedStories={groupedStories}
            onStoryClick={handleStoryClick}
            onAddStory={handleAddStory}
            isLoading={storiesLoading}
          />

          <div className="min-h-screen">
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
                        No posts found. Start following people or create your
                        first post!
                      </p>
                    </div>
                  )}
                </div>

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

      {postForRepost && (
        <RepostModal
          isOpen={isRepostModalOpen}
          onClose={() => {
            setIsRepostModalOpen(false);
            setPostForRepost(null);
          }}
          post={postForRepost as any}
          onRepost={handleRepostConfirm}
          onQuote={handleQuote}
          onViewInteractions={handleViewInteractions}
          isReposted={postForRepost.is_reposted}
        />
      )}

      {selectedStoryIndex !== null && selectedUserStories && (
        <NewStoryViewer
          isOpen={isStoryViewerOpen}
          onClose={() => {
            setIsStoryViewerOpen(false);
            setSelectedStoryIndex(null);
            setSelectedUserStories(null);
          }}
          userStories={selectedUserStories}
          initialStoryIndex={selectedStoryIndex}
          allGroupedStories={groupedStories}
          currentUserIndex={selectedUserIndex}
          onUserChange={(newUserIndex) => {
            setSelectedUserIndex(newUserIndex);
            setSelectedUserStories(groupedStories[newUserIndex]);
          }}
        />
      )}

      <NewStoryModal
        isOpen={isAddStoryModalOpen}
        onClose={() => setIsAddStoryModalOpen(false)}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={completeOnboarding}
      />
    </>
  );
};

export default Feed;
