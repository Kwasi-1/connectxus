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
import { StoriesList } from "@/components/story/StoriesList";
import { StoryViewer } from "@/components/story/StoryViewer";
import { AddStoryModal } from "@/components/story/AddStoryModal";
import { useFeed } from "@/hooks/useFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { createPost } from "@/api/posts.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FeedTab, FeedPost } from "@/types/feed";
import { mockStories } from "@/data/mockStories";
import type { StoryGroup } from "@/types/story";
import { addUserStory, getUserStoryGroup } from "@/utils/storyStorage";

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<FeedTab>("following");
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [postForRepost, setPostForRepost] = useState<FeedPost | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(
    null
  );
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
  const [allStories, setAllStories] = useState<StoryGroup[]>(mockStories);

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

  const handleStoryClick = (storyGroup: StoryGroup, index: number) => {
    setSelectedStoryIndex(index);
    setIsStoryViewerOpen(true);
  };

  const handleAddStory = () => {
    setIsAddStoryModalOpen(true);
  };

  const handleStoryCreated = (
    mediaUrl: string,
    mediaType: "image" | "video"
  ) => {
    if (!user) return;

    // Add the new story
    const newStory = addUserStory(
      user.id,
      user.name,
      user.avatar || "",
      mediaUrl,
      mediaType
    );

    // Update the stories list
    const userStoryGroup = getUserStoryGroup(
      user.id,
      user.name,
      user.avatar || ""
    );

    if (userStoryGroup) {
      // Update existing user story group
      setAllStories((prev) => {
        const withoutUser = prev.filter((sg) => sg.user_id !== user.id);
        return [userStoryGroup, ...withoutUser];
      });
    } else {
      // This shouldn't happen, but just in case
      const newGroup: StoryGroup = {
        user_id: user.id,
        username: user.name,
        avatar: user.avatar || "",
        stories: [newStory],
        has_unseen: false,
      };
      setAllStories((prev) => [newGroup, ...prev]);
    }
  };

  // Load user stories on mount
  useEffect(() => {
    if (user) {
      const userStoryGroup = getUserStoryGroup(
        user.id,
        user.name,
        user.avatar || ""
      );
      if (userStoryGroup) {
        setAllStories((prev) => {
          const withoutUser = prev.filter((sg) => sg.user_id !== user.id);
          return [userStoryGroup, ...withoutUser];
        });
      }
    }
  }, [user]);

  return (
    <>
      <AppLayout onCreatePost={handleCreatePost}>
        <div className="flex-1 border-x-0 xl:border-l-0 xl:border-r border-border">
          <FeedHeader
            activeFilter={activeTab}
            onFilterChange={handleTabChange}
          />

          {/* Stories Section */}
          <StoriesList
            stories={allStories}
            onStoryClick={handleStoryClick}
            onAddStory={handleAddStory}
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
          onQuote={handleQuote}
          onViewInteractions={handleViewInteractions}
          isReposted={postForRepost.is_reposted}
        />
      )}

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          isOpen={isStoryViewerOpen}
          onClose={() => {
            setIsStoryViewerOpen(false);
            setSelectedStoryIndex(null);
          }}
          storyGroups={allStories}
          initialGroupIndex={selectedStoryIndex}
        />
      )}

      {/* Add Story Modal */}
      <AddStoryModal
        isOpen={isAddStoryModalOpen}
        onClose={() => setIsAddStoryModalOpen(false)}
        onStoryCreated={handleStoryCreated}
      />
    </>
  );
};

export default Feed;
