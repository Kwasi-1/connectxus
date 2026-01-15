import { useState } from "react";
import {
  MessageSquare,
  Heart,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  Image,
  MessageCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile, Post, Comment as CommentType } from "@/types/global";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";
import { useFeed } from "@/hooks/useFeed";
import { FeedLoadingSkeleton } from "@/components/feed/PostCardSkeleton";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserReplies, Comment as ApiComment } from "@/api/posts.api";
import { formatDistanceToNow } from "date-fns";

interface ProfileTabsProps {
  user: UserProfile;
  isOwnProfile?: boolean;
}

export const ProfileTabs = ({
  user,
  isOwnProfile = true,
}: ProfileTabsProps) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  // User posts feed
  const {
    posts,
    isLoading: postsLoading,
    hasNextPage: hasMorePosts,
    isFetchingNextPage: isFetchingMorePosts,
    fetchNextPage: fetchMorePosts,
    likePost,
    repostPost,
    deletePost,
    sharePost,
  } = useFeed({
    type: "user",
    userId: user.id,
    enabled: activeTab === "posts",
  });

  // User's media posts
  const {
    posts: mediaPosts,
    isLoading: mediaLoading,
    hasNextPage: hasMoreMedia,
    isFetchingNextPage: isFetchingMoreMedia,
    fetchNextPage: fetchMoreMedia,
  } = useFeed({
    type: "media",
    userId: user.id,
    enabled: activeTab === "media",
  });

  // User's liked posts (only for own profile)
  const {
    posts: likedPosts,
    isLoading: likedLoading,
    hasNextPage: hasMoreLiked,
    isFetchingNextPage: isFetchingMoreLiked,
    fetchNextPage: fetchMoreLiked,
    likePost: likeLikedPost,
    repostPost: repostLikedPost,
    sharePost: shareLikedPost,
  } = useFeed({
    type: "liked",
    userId: user.id,
    enabled: activeTab === "likes" && isOwnProfile,
  });

  // User's replies (comments)
  const {
    data: repliesData,
    isLoading: repliesLoading,
    hasNextPage: hasMoreReplies,
    isFetchingNextPage: isFetchingMoreReplies,
    fetchNextPage: fetchMoreReplies,
  } = useInfiniteQuery({
    queryKey: ["user-replies", user.id],
    queryFn: async ({ pageParam = 1 }) => {
      const replies = await getUserReplies(user.id, {
        page: pageParam,
        limit: 20,
      });
      return {
        replies,
        nextPage: replies.length >= 20 ? pageParam + 1 : undefined,
        hasMore: replies.length >= 20,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    enabled: activeTab === "replies",
  });

  const replies = repliesData?.pages?.flatMap((page) => page.replies) ?? [];

  const { loadMoreRef: postsLoadMoreRef } = useInfiniteScroll({
    loading: isFetchingMorePosts,
    hasMore: hasMorePosts || false,
    onLoadMore: fetchMorePosts,
  });

  const { loadMoreRef: mediaLoadMoreRef } = useInfiniteScroll({
    loading: isFetchingMoreMedia,
    hasMore: hasMoreMedia || false,
    onLoadMore: fetchMoreMedia,
  });

  const { loadMoreRef: likedLoadMoreRef } = useInfiniteScroll({
    loading: isFetchingMoreLiked,
    hasMore: hasMoreLiked || false,
    onLoadMore: fetchMoreLiked,
  });

  const { loadMoreRef: repliesLoadMoreRef } = useInfiniteScroll({
    loading: isFetchingMoreReplies,
    hasMore: hasMoreReplies || false,
    onLoadMore: fetchMoreReplies,
  });

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleQuote = (postId: string) => {};

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  const getTabs = () => {
    const baseTabs = [
      {
        id: "posts",
        label: "Posts",
        count: posts?.length || null,
      },
      {
        id: "replies",
        label: "Replies",
        count: replies?.length || null,
      },
      {
        id: "media",
        label: "Media",
        count: mediaPosts?.length || null,
      },
    ];

    if (isOwnProfile) {
      baseTabs.push({
        id: "likes",
        label: "Likes",
        count: likedPosts?.length || null,
      });

      baseTabs.push({
        id: "settings",
        label: "Settings",
        count: null,
      });
    }

    return baseTabs;
  };

  const tabs = getTabs();

  // Reply item component
  const ReplyItem = ({ reply }: { reply: ApiComment }) => {
    const authorUsername = reply.author?.username || "unknown";
    const authorFullName = reply.author?.full_name || "Unknown User";
    const authorAvatar = reply.author?.avatar;

    return (
      <div
        className="p-4 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={() => navigate(`/post/${reply.post_id}`)}
      >
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={authorAvatar || undefined} />
            <AvatarFallback className="text-xs">
              {authorFullName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">
                {authorFullName}
              </span>
              <span className="text-sm text-muted-foreground">
                @{authorUsername}
              </span>
              <span className="text-xs text-muted-foreground">
                · {formatTimeAgo(reply.created_at)}
              </span>
            </div>
            <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
              {reply.content}
            </p>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span>{reply.likes_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>View thread</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Tabs
      defaultValue="posts"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="w-full text-muted-foreground h-10 bg-transparent rounded-none p-0 overflow-x-auto justify-start border-b gap-4 px-3">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="mx- px-1 mx-auto h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground hover:border-foreground/20"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{tab.label}</span>
              {tab.count !== null && (
                <span className="text-muted-foreground">({tab.count})</span>
              )}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Posts Tab */}
      <TabsContent value="posts" className="space-y-0 mt-0">
        {postsLoading ? (
          <FeedLoadingSkeleton count={5} />
        ) : (
          <>
            {posts && posts.length > 0 ? (
              <>
                <div className="divide-y divide-border">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={authUser?.id}
                    />
                  ))}
                </div>

                {hasMorePosts && (
                  <div ref={postsLoadMoreRef} className="py-4 text-center">
                    {isFetchingMorePosts && <FeedLoadingSkeleton count={2} />}
                  </div>
                )}

                {!hasMorePosts && posts && posts.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No posts yet</p>
                <p className="text-sm">
                  When {isOwnProfile ? "you" : user.username} post something, it
                  will show up here.
                </p>
              </div>
            )}
          </>
        )}
      </TabsContent>

      {/* Replies Tab */}
      <TabsContent value="replies" className="space-y-0 mt-0">
        {repliesLoading ? (
          <FeedLoadingSkeleton count={5} />
        ) : (
          <>
            {replies && replies.length > 0 ? (
              <>
                <div>
                  {replies.map((reply) => (
                    <ReplyItem key={reply.id} reply={reply} />
                  ))}
                </div>

                {hasMoreReplies && (
                  <div ref={repliesLoadMoreRef} className="py-4 text-center">
                    {isFetchingMoreReplies && <FeedLoadingSkeleton count={2} />}
                  </div>
                )}

                {!hasMoreReplies && replies && replies.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No replies yet</p>
                <p className="text-sm">
                  When {isOwnProfile ? "you reply" : `${user.username} replies`}{" "}
                  to posts, they'll show up here.
                </p>
              </div>
            )}
          </>
        )}
      </TabsContent>

      {/* Media Tab */}
      <TabsContent value="media" className="space-y-0 mt-0">
        {mediaLoading ? (
          <FeedLoadingSkeleton count={5} />
        ) : (
          <>
            {mediaPosts && mediaPosts.length > 0 ? (
              <>
                <div className="divide-y divide-border">
                  {mediaPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={authUser?.id}
                    />
                  ))}
                </div>

                {hasMoreMedia && (
                  <div ref={mediaLoadMoreRef} className="py-4 text-center">
                    {isFetchingMoreMedia && <FeedLoadingSkeleton count={2} />}
                  </div>
                )}

                {!hasMoreMedia && mediaPosts && mediaPosts.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No media yet</p>
                <p className="text-sm">
                  Photos and videos from posts will appear here.
                </p>
              </div>
            )}
          </>
        )}
      </TabsContent>

      {isOwnProfile && (
        <>
          {/* Likes Tab */}
          <TabsContent value="likes" className="space-y-0 mt-0">
            {likedLoading ? (
              <FeedLoadingSkeleton count={5} />
            ) : (
              <>
                {likedPosts && likedPosts.length > 0 ? (
                  <>
                    <div className="divide-y divide-border">
                      {likedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUserId={authUser?.id}
                        />
                      ))}
                    </div>

                    {hasMoreLiked && (
                      <div ref={likedLoadMoreRef} className="py-4 text-center">
                        {isFetchingMoreLiked && (
                          <FeedLoadingSkeleton count={2} />
                        )}
                      </div>
                    )}

                    {!hasMoreLiked && likedPosts && likedPosts.length > 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        You've reached the end
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No likes yet</p>
                    <p className="text-sm">
                      Tap the heart on posts you like and they'll show up here.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="rounded-none border-0">
              <CardContent className="p-6 space-y-6 rounded-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Appearance</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize how Campus Vibe looks on your device
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified about activity via email
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Privacy Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Control your privacy and data settings
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};
