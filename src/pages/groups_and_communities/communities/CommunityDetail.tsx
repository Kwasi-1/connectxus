
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockCommunities, mockCommunityPosts } from '@/data/mockCommunitiesData';
import { Community, CommunityPost } from '@/types/communities';
import { Post } from '@/types/global';
import { mockUsers } from '@/data/mockData';
import { Users, MapPin, Globe } from 'lucide-react';

const CommunityDetail = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundCommunity = mockCommunities.find(c => c.id === communityId);
      setCommunity(foundCommunity || null);
      setLoading(false);
    };

    fetchCommunity();
  }, [communityId]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!communityId) return;
      
      setPostsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const communityPosts = mockCommunityPosts.filter(p => p.communityId === communityId);
      setPosts(communityPosts);
      setPostsLoading(false);
    };

    fetchPosts();
  }, [communityId]);

  const handleCreatePost = (content: string) => {
    if (!community) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      communityId: community.id,
      author: mockUsers[0],
      content,
      likes: 0,
      comments: 0,
      reposts: 0,
      isLiked: false,
      isReposted: false,
      createdAt: new Date(),
      images: [],
    };

    setPosts([newPost, ...posts]);
  };

  const convertToPost = (communityPost: CommunityPost): Post => {
    return {
      ...communityPost,
      quotes: 0,
      video: undefined,
      updatedAt: undefined,
    };
  };

  const handleLike = (postId: string) => {
    console.log('Like post:', postId);
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleRepost = (postId: string) => {
    console.log('Repost:', postId);
  };

  const handleQuote = (postId: string) => {
    console.log('Quote post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen border-r border-border">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!community) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Community not found</h1>
          <p className="text-muted-foreground mt-2">The community you're looking for doesn't exist.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen border-r border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="p-4">
            <h1 className="text-xl font-bold text-foreground">{community.name}</h1>
            <p className="text-sm text-muted-foreground">{community.memberCount.toLocaleString()} members</p>
          </div>
        </div>

        {/* Community Info */}
        <div className="p-6 border-b border-border">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{community.name}</h2>
              <p className="text-muted-foreground mt-2">{community.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{community.memberCount.toLocaleString()} members</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{community.category}</Badge>
            </div>

            <Button className="w-full sm:w-auto">
              {community.isJoined ? 'Leave Community' : 'Join Community'}
            </Button>
          </div>
        </div>

        {/* Post Composer */}
        <div className="border-b border-border">
          <PostComposer onPost={handleCreatePost} />
        </div>

        {/* Posts Feed */}
        <div>
          {postsLoading ? (
            <LoadingSpinner size="md" />
          ) : posts.length > 0 ? (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={convertToPost(post)}
                  onLike={handleLike}
                  onComment={handleComment}
                  onRepost={handleRepost}
                  onQuote={handleQuote}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No posts in this community yet.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CommunityDetail;
