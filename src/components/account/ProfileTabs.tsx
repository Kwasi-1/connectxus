import { useState } from "react";
import {
  MessageSquare,
  Heart,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile, Post } from "@/types/global";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";
import { useFeed } from "@/hooks/useFeed";
import { FeedLoadingSkeleton } from "@/components/feed/PostCardSkeleton";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useNavigate } from "react-router-dom";

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

  const { loadMoreRef: postsLoadMoreRef } = useInfiniteScroll({
    loading: isFetchingMorePosts,
    hasMore: hasMorePosts || false,
    onLoadMore: fetchMorePosts,
  });

  const { loadMoreRef: likedLoadMoreRef } = useInfiniteScroll({
    loading: isFetchingMoreLiked,
    hasMore: hasMoreLiked || false,
    onLoadMore: fetchMoreLiked,
  });

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleQuote = (postId: string) => {};

  const getTabs = () => {
    const baseTabs = [
      {
        id: "posts",
        label: "Posts",
        count: posts?.length || 0,
      },
    ];

    if (isOwnProfile) {
      baseTabs.push({
        id: "likes",
        label: "Likes",
        count: likedPosts?.length || 0,
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

  return (
    <Tabs
      defaultValue="posts"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="w-full text-muted-foreground h-10 bg-transparent rounded-none p-0 overflow-x-auto justify-start border-b">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="px-1 mx-auto h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground hover:border-foreground/20"
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* <tab.icon className="h-4 w-4" /> */}
              <span className="truncate">{tab.label}</span>
              {tab.count !== null && (
                <span className="text-muted-foreground">({tab.count})</span>
              )}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

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

                {/* Infinite scroll trigger */}
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

      {isOwnProfile && (
        <>
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

                    {/* Infinite scroll trigger */}
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

          <TabsContent value="groups" className="space-y-4 mt-0">
            <div className="pt-4" />
            {user.joinedGroups && user.joinedGroups.length > 0 ? (
              user.joinedGroups.map((group) => (
                <Card
                  key={group.id}
                  className="border-0 border-b border-border rounded-none"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={group.avatar} />
                        <AvatarFallback>
                          {group.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {group.members} members • {group.category}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No groups joined</p>
                <p className="text-sm">
                  Join groups to connect with others who share your interests.
                </p>
              </div>
            )}
          </TabsContent>

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
