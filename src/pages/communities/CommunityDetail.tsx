import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PostCard } from '@/components/feed/PostCard';
import { mockCommunities } from '@/data/mockCommunitiesData';
import { Community } from '@/types/communities';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/global';

const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunity = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      const foundCommunity = mockCommunities.find(c => c.id === id);
      setCommunity(foundCommunity || null);
      setIsLoading(false);
    };

    loadCommunity();
  }, [id]);

  const handleJoinCommunity = () => {
    if (community) {
      setCommunity({
        ...community,
        isJoined: !community.isJoined,
        memberCount: community.isJoined ? community.memberCount - 1 : community.memberCount + 1
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout showRightSidebar={false}>
        <LoadingSpinner size="lg" />
      </AppLayout>
    );
  }

  if (!community) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Community Not Found</h1>
          <p className="text-muted-foreground mb-4">The community you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/communities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/communities')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Communities
        </Button>

        {/* Community Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={community.avatar} alt={community.name} />
                <AvatarFallback className="text-lg">{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{community.name}</CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary">{community.category}</Badge>
                      <span className="text-muted-foreground flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {community.memberCount} members
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleJoinCommunity}
                    variant={community.isJoined ? 'outline' : 'default'}
                  >
                    {community.isJoined ? 'Leave Community' : 'Join Community'}
                  </Button>
                </div>
                <p className="text-muted-foreground mt-3">{community.description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Community Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {community.posts.length > 0 ? (
              community.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    content: post.content,
                    author: {
                      id: post.author.id,
                      username: post.author.username,
                      displayName: post.author.name,
                      email: `${post.author.username}@university.edu`,
                      avatar: post.author.avatar,
                      verified: false,
                      followers: 0,
                      following: 0,
                      createdAt: new Date('2024-01-01')
                    } as User,
                    createdAt: post.createdAt.toISOString(),
                    likes: post.likes,
                    comments: post.replies,
                    shares: 0,
                    isLiked: post.isLiked,
                    isShared: false,
                    images: []
                  }}
                  onLike={() => {}}
                  onShare={() => {}}
                  onComment={() => {}}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="announcements">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No announcements yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CommunityDetail;
