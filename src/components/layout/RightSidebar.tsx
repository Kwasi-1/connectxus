import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAnnouncements } from "@/api/announcements.api";
import { getSuggestedUsers, followUser, unfollowUser } from "@/api/users.api";
import { getTrendingTopics } from "@/api/topics.api";
import { formatDistanceToNow } from "date-fns";
import { postsApi } from "@/api/posts.api";

import { storiesApi } from "@/api/stories.api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const TrendingTopicSkeleton = () => (
  <div className="p-3 space-y-2">
    <Skeleton className="h-3 w-32" />
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-3 w-24" />
  </div>
);

const CampusHighlightSkeleton = () => (
  <div className="p-3 space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-20" />
  </div>
);

const UserSkeleton = () => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-8 w-20 rounded-full" />
  </div>
);

interface RightSidebarProps {
  isOnboardingActive?: boolean; // Block all queries during onboarding
}

export function RightSidebar({
  isOnboardingActive = false,
}: RightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Only enable queries if sidebar is visible AND onboarding is not active
  const queriesEnabled = isVisible && !isOnboardingActive;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (sidebarRef.current) {
      observer.observe(sidebarRef.current);
    }

    return () => {
      if (sidebarRef.current) {
        observer.unobserve(sidebarRef.current);
      }
    };
  }, []);

  const { data: trendingTopics = [], isLoading: loadingTrending } = useQuery({
    queryKey: ["trending-topics"],
    queryFn: () => getTrendingTopics({ page: 1, limit: 5 }),
    staleTime: 600000,
    gcTime: 900000,
    enabled: queriesEnabled, // Block during onboarding
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: activeStories = [], isLoading: loadingStories } = useQuery({
    queryKey: ["active-stories"],
    queryFn: () => storiesApi.getActiveStories(),
    staleTime: 300000,
    enabled: queriesEnabled, // Block during onboarding
    refetchOnWindowFocus: false,
  });

  const { data: highlights = [], isLoading: loadingHighlights } = useQuery({
    queryKey: ["campus-highlights"],
    queryFn: () => postsApi.getCampusHighlights(),
    staleTime: 600000,
    enabled: queriesEnabled, // Block during onboarding
  });

  const { data: announcements = [], isLoading: loadingAnnouncements } =
    useQuery({
      queryKey: ["announcements"],
      queryFn: () =>
        getAnnouncements({ status: "published", page: 1, limit: 5 }),
      staleTime: 600000,
      gcTime: 900000,
      enabled: queriesEnabled, // Block during onboarding
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });

  const { data: suggestedUsers = [], isLoading: loadingSuggestedUsers } =
    useQuery({
      queryKey: ["suggested-users"],
      queryFn: () => getSuggestedUsers({ page: 1, limit: 3 }),
      staleTime: 900000,
      gcTime: 1200000,
      enabled: queriesEnabled, // Block during onboarding
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });

  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: (_, userId) => {
      setFollowedUsers((prev) => new Set(prev).add(userId));
      queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
      toast.success("Following user successfully!");
    },
    onError: () => {
      toast.error("Failed to follow user");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: (_, userId) => {
      setFollowedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
      toast.success("Unfollowed user successfully!");
    },
    onError: () => {
      toast.error("Failed to unfollow user");
    },
  });

  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      const updatedHistory = [
        query,
        ...searchHistory.filter((item) => item !== query),
      ].slice(0, 3);
      setSearchHistory(updatedHistory);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

      navigate(`/explore?q=${encodeURIComponent(query)}`);
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const removeSearchHistory = (query: string) => {
    const updatedHistory = searchHistory.filter((item) => item !== query);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  const handleFollow = (userId: string) => {
    const isCurrentlyFollowing = followedUsers.has(userId);

    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  return (
    <div className="w-full" ref={sidebarRef}>
      <div className="p-4 pl-6 sticky top-0 bg-background py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search Campus Vibe"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10 py-3 border rounded-full text-base"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 pl-6 pt-2 space-y-2">
        <div className="flex flex-col-reverse gap-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                What's happening
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingTrending ? (
                <>
                  <TrendingTopicSkeleton />
                  <TrendingTopicSkeleton />
                  <TrendingTopicSkeleton />
                </>
              ) : trendingTopics.length === 0 ? (
                <div className="p-3 text-left text-sm text-muted-foreground">
                  No trending topics at the moment
                </div>
              ) : (
                trendingTopics.map((topic: any, index: number) => (
                  <div
                    key={topic.id}
                    className="hover:bg-muted p-3 rounded-lg cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(`/explore?q=${encodeURIComponent(topic.name)}`)
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {index + 1} · Trending in {topic.category}
                        </p>
                        <p className="font-semibold text-foreground text-base">
                          {topic.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {topic.posts_count.toLocaleString()}{" "}
                          {topic.posts_count === 1 ? "post" : "posts"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="ghost"
                className="w-full text-primary hover:opacity-70 hover:bg-transparent justify-start transition duration-300"
                onClick={() => navigate("/explore")}
              >
                Show more
              </Button>
            </CardContent>
          </Card>

          {/* New Campus Highlights Card */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                Campus Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingHighlights ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : highlights.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  No highlights at the moment
                </div>
              ) : (
                highlights.map((highlight: any) => (
                  <div
                    key={highlight.id}
                    className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-border/50"
                    onClick={() => navigate(`/post/${highlight.post_id}`)}
                  >
                    <p className="font-medium text-sm line-clamp-2 mb-2 text-foreground">
                      {highlight.post_content}
                    </p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={highlight.author_avatar} />
                        <AvatarFallback>
                          {highlight.author_username?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground font-medium">
                        @{highlight.author_username}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">Who to follow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSuggestedUsers ? (
                <>
                  <UserSkeleton />
                  <UserSkeleton />
                  <UserSkeleton />
                </>
              ) : suggestedUsers.length === 0 ? (
                <div className="p-3 text-left text-sm text-muted-foreground">
                  No user suggestions available
                </div>
              ) : (
                suggestedUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div
                      className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold text-foreground">
                            {user.full_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={
                        followedUsers.has(user.id) ? "outline" : "default"
                      }
                      className={
                        followedUsers.has(user.id)
                          ? "border-border text-foreground hover:bg-muted rounded-full px-4"
                          : "bg-foreground text-background hover:bg-foreground/90 rounded-full px-4"
                      }
                      onClick={() => handleFollow(user.id)}
                      disabled={
                        followMutation.isPending || unfollowMutation.isPending
                      }
                    >
                      {followMutation.isPending ||
                      unfollowMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : followedUsers.has(user.id) ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </Button>
                  </div>
                ))
              )}
              <Button
                variant="ghost"
                className="w-full text-primary hover:opacity-70 hover:bg-transparent justify-start transition duration-300"
                onClick={() => navigate("/people")}
              >
                Show more
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
