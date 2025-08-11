import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MapPin, ExternalLink, Plus, MoreVertical } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCommunities, mockCommunityPosts, mockEvents } from '@/data/mockCommunitiesData';
import { Community, CommunityEvent, CommunityPost } from '@/types/communities';
import { Post } from '@/types/global';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchCommunityData = async () => {
      setIsLoading(true);
      
      // Find community
      const foundCommunity = mockCommunities.find(c => c.id === communityId);
      setCommunity(foundCommunity || null);
      
      // Filter posts for this community
      const communityPosts = mockCommunityPosts.filter(p => p.communityId === communityId);
      setPosts(communityPosts);
      
      // Filter events for this community
      const communityEvents = mockEvents.filter(e => e.communityId === communityId);
      setEvents(communityEvents);
      
      setIsLoading(false);
    };

    fetchCommunityData();
  }, [communityId]);

  const handleJoinCommunity = () => {
    if (community) {
      setCommunity({
        ...community,
        isJoined: !community.isJoined,
        memberCount: community.isJoined ? community.memberCount - 1 : community.memberCount + 1
      });
    }
  };

  const handleCreatePost = (content: string) => {
    // This would typically make an API call
    console.log('Creating post in community:', communityId, content);
  };

  const convertToPost = (communityPost: CommunityPost): Post => {
    return {
      ...communityPost,
      quotes: 0,
      images: communityPost.images || undefined,
      video: communityPost.video || undefined,
      updatedAt: communityPost.updatedAt || undefined,
      isLiked: communityPost.isLiked,
      isReposted: communityPost.isReposted,
      likes: communityPost.likes,
      comments: communityPost.comments,
      reposts: communityPost.reposts,
    };
  };

  const handleLike = () => {
    console.log('Like post');
  };

  const handleComment = () => {
    console.log('Comment on post');
  };

  const handleRepost = () => {
    console.log('Repost');
  };

  const handleQuote = () => {
    console.log('Quote post');
  };

  const handleShare = () => {
    console.log('Share post');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!community) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Community Not Found</h2>
            <p className="text-muted-foreground">Sorry, we couldn't find the community you're looking for.</p>
            <Button variant="link" onClick={() => navigate('/communities')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Communities
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/communities')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Communities
            </Button>
            <Button variant="outline" onClick={handleJoinCommunity}>
              {community.isJoined ? 'Leave Community' : 'Join Community'}
            </Button>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={community.avatar} alt={community.name} />
              <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{community.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{community.memberCount} Members</span>
              </div>
            </div>
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{community.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created: {new Date(community.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Location: {community.location || 'N/A'}</span>
                </div>
                {community.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-none">
            <TabsTrigger 
              value="posts" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Events <Badge variant="secondary">{events.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              About
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0">
            <div className="border-b border-border p-4">
              <PostComposer onPost={handleCreatePost} placeholder={`What's happening in ${community?.name}?`} />
            </div>
            
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={convertToPost(post)}
                  onLike={handleLike}
                  onRepost={handleRepost}
                  onComment={handleComment}
                  onQuote={handleQuote}
                  onShare={handleShare}
                />
              ))}
              {posts.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-0">
            <div className="grid gap-4 p-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {event.title}
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</span>
                      <span className="text-sm text-muted-foreground">{event.time}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Location: {event.location}</span>
                      </div>
                      {event.link && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                            Learn More
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {events.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No events scheduled yet. Stay tuned!</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="mt-0">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">About {community.name}</h3>
              <p className="text-sm text-muted-foreground">{community.longDescription || community.description}</p>
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-1">Contact</h4>
                <p className="text-sm text-muted-foreground">
                  If you have any questions or inquiries, feel free to reach out to the community admins.
                </p>
                <Button variant="link" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Contact Admins
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CommunityDetail;
