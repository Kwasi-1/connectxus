import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
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

export function RightSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
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
    enabled: isVisible,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: announcements = [], isLoading: loadingAnnouncements } =
    useQuery({
      queryKey: ["announcements"],
      queryFn: () =>
        getAnnouncements({ status: "published", page: 1, limit: 5 }),
      staleTime: 600000,
      gcTime: 900000,
      enabled: isVisible,
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
      enabled: isVisible,
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
            className="pl-10 py-3 border rounded-full text-base"
          />
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
                trendingTopics.map((topic, index) => (
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
                className="w-full text-primary hover:bg-muted justify-start"
                onClick={() => navigate("/explore")}
              >
                Show more
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                Campus Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAnnouncements ? (
                <>
                  <CampusHighlightSkeleton />
                  <CampusHighlightSkeleton />
                  <CampusHighlightSkeleton />
                </>
              ) : announcements.length === 0 ? (
                <div className="p-3 text-left text-sm text-muted-foreground">
                  No announcements available
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="hover:bg-muted p-3 rounded-lg cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(`/announcements/${announcement.id}`)
                    }
                  >
                    <h4 className="font-semibold text-foreground text-base">
                      {announcement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {announcement.created_at &&
                        formatDistanceToNow(new Date(announcement.created_at), {
                          addSuffix: true,
                        })}
                    </p>
                  </div>
                ))
              )}
              <Button
                variant="ghost"
                className="w-full text-primary hover:bg-muted justify-start"
                onClick={() => navigate("/announcements")}
              >
                View all announcements
              </Button>
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
                suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
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
                              .map((n) => n[0])
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
                className="w-full text-primary hover:bg-muted text-left items-start justify-start"
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
