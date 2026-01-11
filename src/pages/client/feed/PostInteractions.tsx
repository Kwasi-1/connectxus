import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostQuotesPaginated, getPostRepostsPaginated } from '@/api/posts.api';
import { followUser, unfollowUser } from '@/api/users.api';
import { PostCard } from '@/components/feed/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import moment from 'moment';
import type { Post } from '@/api/posts.api';
import type { UserRepost } from '@/api/posts.api';

const ITEMS_PER_PAGE = 20;

export default function PostInteractions() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'quotes' | 'reposts'>('quotes');

  const {
    data: quotesData,
    isLoading: loadingQuotes,
    isFetchingNextPage: isFetchingNextQuotes,
    hasNextPage: hasNextQuotesPage,
    fetchNextPage: fetchNextQuotesPage,
  } = useInfiniteQuery({
    queryKey: ['post-quotes', postId],
    queryFn: ({ pageParam = 1 }) =>
      getPostQuotesPaginated(postId!, { page: pageParam, limit: ITEMS_PER_PAGE }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!postId,
  });

  const {
    data: repostsData,
    isLoading: loadingReposts,
    isFetchingNextPage: isFetchingNextReposts,
    hasNextPage: hasNextRepostsPage,
    fetchNextPage: fetchNextRepostsPage,
  } = useInfiniteQuery({
    queryKey: ['post-reposts', postId],
    queryFn: ({ pageParam = 1 }) =>
      getPostRepostsPaginated(postId!, { page: pageParam, limit: ITEMS_PER_PAGE }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!postId,
  });

  const quotes = quotesData?.pages.flatMap(page => page) || [];
  const reposts = repostsData?.pages.flatMap(page => page) || [];

  const { loadMoreRef: quotesLoadMoreRef } = useInfiniteScroll({
    loading: isFetchingNextQuotes,
    hasMore: hasNextQuotesPage || false,
    onLoadMore: fetchNextQuotesPage,
  });

  const { loadMoreRef: repostsLoadMoreRef } = useInfiniteScroll({
    loading: isFetchingNextReposts,
    hasMore: hasNextRepostsPage || false,
    onLoadMore: fetchNextRepostsPage,
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reposts', postId] });
      toast.success('Followed successfully');
    },
    onError: () => {
      toast.error('Failed to follow user');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reposts', postId] });
      toast.success('Unfollowed successfully');
    },
    onError: () => {
      toast.error('Failed to unfollow user');
    },
  });

  const handleFollowToggle = (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleLike = (postId: string) => {
  };

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: string) => {
  };

  const handleQuote = (postId: string) => {
    navigate('/compose', { state: { quotedPostId: postId } });
  };

  const handleShare = (postId: string) => {
  };

  return (
    <AppLayout>
      <div className="flex-1 border-l xl:border-l-0 border-r border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Post Interactions</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'quotes' | 'reposts')}>
          <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="quotes"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
            >
              Quotes
            </TabsTrigger>
            <TabsTrigger
              value="reposts"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
            >
              Reposts
            </TabsTrigger>
          </TabsList>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="mt-0">
            {loadingQuotes ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Loading quotes...</p>
              </div>
            ) : quotes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No quotes yet</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {quotes.map((quote: Post) => (
                    <PostCard
                      key={quote.id}
                      post={quote}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>

                {/* Infinite scroll trigger for quotes */}
                {hasNextQuotesPage && (
                  <div ref={quotesLoadMoreRef} className="flex justify-center py-8">
                    {isFetchingNextQuotes && (
                      <p className="text-muted-foreground">Loading more quotes...</p>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Reposts Tab */}
          <TabsContent value="reposts" className="mt-0">
            {loadingReposts ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Loading reposts...</p>
              </div>
            ) : reposts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No reposts yet</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {reposts.map((repost: UserRepost) => (
                    <div
                      key={repost.id}
                      className="p-4 hover:bg-muted/5 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex items-start space-x-3 flex-1 cursor-pointer"
                          onClick={() => handleUserClick(repost.id)}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={repost.avatar || '/api/placeholder/48/48'} />
                            <AvatarFallback>
                              {repost.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-foreground hover:underline">
                                {repost.full_name}
                              </span>
                              {repost.verified && (
                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              @{repost.username}
                            </p>

                            {repost.bio && (
                              <p className="text-sm text-foreground mt-2 line-clamp-2">
                                {repost.bio}
                              </p>
                            )}

                            {repost.reposted_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Reposted {moment(repost.reposted_at).fromNow()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Follow/Unfollow button */}
                        {user?.id !== repost.id && (
                          <Button
                            variant={repost.is_following ? 'outline' : 'default'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(repost.id, repost.is_following || false);
                            }}
                            disabled={followMutation.isPending || unfollowMutation.isPending}
                          >
                            {repost.is_following ? 'Unfollow' : 'Follow'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Infinite scroll trigger for reposts */}
                {hasNextRepostsPage && (
                  <div ref={repostsLoadMoreRef} className="flex justify-center py-8">
                    {isFetchingNextReposts && (
                      <p className="text-muted-foreground">Loading more reposts...</p>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
