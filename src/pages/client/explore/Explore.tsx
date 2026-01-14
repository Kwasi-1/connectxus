import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, ArrowLeft, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/feed/PostCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchApi } from "@/api/search.api";
import { toggleLikePost, repostPost } from "@/api/posts.api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type SearchTab = "top" | "latest" | "people" | "media";

const Explore = () => {
  const [activeTab, setActiveTab] = useState<SearchTab>("top");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["explore", searchQuery, activeTab],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;

      if (activeTab === "people") {
        const users = await searchApi.searchUsers({
          query: searchQuery,
          page: 1,
          limit: 50,
        });
        return { users, posts: [] };
      } else {
        const posts = await searchApi.searchPosts({
          query: searchQuery,
          page: 1,
          limit: 50,
        });
        return { posts, users: [] };
      }
    },
    enabled: !!searchQuery.trim(),
    staleTime: 30000,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => toggleLikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({
        queryKey: ["explore", searchQuery, activeTab],
      });
      const previousData = queryClient.getQueryData([
        "explore",
        searchQuery,
        activeTab,
      ]);

      queryClient.setQueryData(
        ["explore", searchQuery, activeTab],
        (old: any) => {
          if (!old || !old.posts) return old;
          return {
            ...old,
            posts: old.posts.map((post: any) =>
              post.id === postId
                ? {
                    ...post,
                    is_liked: !post.is_liked,
                    likes_count: post.is_liked
                      ? post.likes_count - 1
                      : post.likes_count + 1,
                  }
                : post
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err, postId, context: any) => {
      queryClient.setQueryData(
        ["explore", searchQuery, activeTab],
        context?.previousData
      );
      toast.error("Failed to like post");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["explore"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["liked-posts"] });
    },
  });

  const repostMutation = useMutation({
    mutationFn: (postId: string) => repostPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explore"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Post reposted!");
    },
    onError: () => {
      toast.error("Failed to repost");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: string) => {
    repostMutation.mutate(postId);
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleQuote = (post: any) => {
    navigate(`/compose?quote=${post.id}`);
  };

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const processedPosts = searchResults?.posts
    ? (() => {
        let posts = [...searchResults.posts];

        if (activeTab === "latest") {
          posts.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
        } else if (activeTab === "media") {
          posts = posts.filter((post) => post.media && post.media.length > 0);
        } else if (activeTab === "top") {
          posts.sort(
            (a, b) =>
              b.likes_count +
              b.comments_count +
              b.reposts_count -
              (a.likes_count + a.comments_count + a.reposts_count)
          );
        }

        return posts;
      })()
    : [];

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        <div className="sticky top-16 lg:top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-hover transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 py-3 border rounded-full text-base bg-muted/50 border-transparent focus:bg-background focus:border-border"
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
            </form>
          </div>

          {searchQuery && (
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as SearchTab)}
            >
              <TabsList className="w-full justify-evenly rounded-none pb-0 h-auto bg-transparent border-none">
                <TabsTrigger
                  value="top"
                  className="flex1 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Top
                </TabsTrigger>
                <TabsTrigger
                  value="latest"
                  className="flex1 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Latest
                </TabsTrigger>
                <TabsTrigger
                  value="people"
                  className="flex1 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  People
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="flex1 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Media
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="mt-0">
          {!searchQuery ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                Try searching for people, topics, or keywords
              </p>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as SearchTab)}
            >
              <TabsContent value="top" className="mt-0">
                {isLoading ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <div className="divide-y divide-border">
                    {processedPosts.length > 0 ? (
                      processedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUserId={user?.id}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">
                          No results found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="latest" className="mt-0">
                {isLoading ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <div className="divide-y divide-border">
                    {processedPosts.length > 0 ? (
                      processedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUserId={user?.id}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">
                          No recent results found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="people" className="mt-0">
                {isLoading ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <div className="divide-y divide-border">
                    {searchResults?.users && searchResults.users.length > 0 ? (
                      searchResults.users.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserClick(user.username)}
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.username.split("@")[0]}
                              className="w-12 h-12 rounded-full object-cover overflow-hidden"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="font-semibold text-foreground truncate">
                                  {user.full_name || user.username}
                                </p>
                                {user.verified && (
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">
                                      ✓
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm">
                                @{user.username}
                              </p>
                              {user.bio && (
                                <p className="text-foreground text-sm mt-1 line-clamp-2">
                                  {user.bio}
                                </p>
                              )}
                              <p className="text-muted-foreground text-sm mt-1">
                                {(user.followers_count || 0).toLocaleString()}{" "}
                                followers
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">
                          No people found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                {isLoading ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <div className="divide-y divide-border">
                    {processedPosts.length > 0 ? (
                      processedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUserId={user?.id}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">
                          No media found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
