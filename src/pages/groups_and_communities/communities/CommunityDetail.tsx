
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PostCard } from '@/components/feed/PostCard';
import { ArrowLeft, Users, Calendar, Settings, Pin } from 'lucide-react';
import { mockCommunities, mockCommunityPosts, mockAnnouncements } from '@/data/mockCommunitiesData';
import { Community, CommunityPost, Announcement } from '@/types/communities';
import { Post } from '@/types/global';

type CommunityTab = 'posts' | 'announcements' | 'members' | 'settings';

const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CommunityTab>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const currentUserId = 'user-1'; // Mock current user ID

  useEffect(() => {
    const fetchCommunity = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundCommunity = mockCommunities.find(c => c.id === id);
        if (foundCommunity) {
          setCommunity(foundCommunity);
        }
      } catch (error) {
        console.error('Error fetching community:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCommunity();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'posts' && id) {
      fetchPosts();
    } else if (activeTab === 'announcements' && id) {
      fetchAnnouncements();
    }
  }, [activeTab, id]);

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const communityPosts = mockCommunityPosts
        .filter(p => p.communityId === id)
        .map(p => ({
          ...p,
          images: p.images || [],
          video: undefined,
          updatedAt: undefined
        } as Post));
      
      setPosts(communityPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const communityAnnouncements = mockAnnouncements.filter(a => a.communityId === id);
      setAnnouncements(communityAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handleJoinCommunity = () => {
    if (community) {
      setCommunity({
        ...community,
        isJoined: !community.isJoined,
        memberCount: community.isJoined ? community.memberCount - 1 : community.memberCount + 1
      });
    }
  };

  const handlePostAction = (postId: string, action: 'like' | 'repost' | 'comment') => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        switch (action) {
          case 'like':
            return {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            };
          case 'repost':
            return {
              ...post,
              isReposted: !post.isReposted,
              reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1
            };
          default:
            return post;
        }
      }
      return post;
    }));
  };

  const isAdmin = community?.admins.includes(currentUserId);
  const isModerator = community?.moderators.includes(currentUserId);
  const canManage = isAdmin || isModerator;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!community) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Community not found</h2>
          <p className="text-muted-foreground mb-4">The community you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/communities')}>
            Back to Communities
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        {/* Header */}
        <div className="sticky top-16 lg:top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/communities')}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{community.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {community.memberCount.toLocaleString()} members
                  </p>
                </div>
              </div>
              {canManage && (
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Community Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={community.coverImage} alt={community.name} />
              <AvatarFallback className="text-lg">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{community.name}</h2>
              <p className="text-muted-foreground mt-1">{community.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary">{community.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {community.memberCount.toLocaleString()} members
                </span>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {community.createdAt.toLocaleDateString()}
                </span>
              </div>
              <Button
                onClick={handleJoinCommunity}
                variant={community.isJoined ? 'outline' : 'default'}
                className="mt-4"
              >
                {community.isJoined ? 'Leave Community' : 'Join Community'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CommunityTab)}>
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            <TabsTrigger 
              value="posts" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="announcements" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Announcements
            </TabsTrigger>
            {canManage && (
              <>
                <TabsTrigger 
                  value="members" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Members
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Settings
                </TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="posts" className="mt-0">
            {postsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="divide-y divide-border">
                {posts.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No posts yet in this community</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() => handlePostAction(post.id, 'like')}
                      onRepost={() => handlePostAction(post.id, 'repost')}
                      onComment={() => handlePostAction(post.id, 'comment')}
                      onShare={() => {}}
                    />
                  ))
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="announcements" className="mt-0">
            {announcementsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="divide-y divide-border">
                {announcements.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No announcements yet</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 hover:bg-muted/5">
                      <div className="flex items-start gap-3">
                        {announcement.isPinned && (
                          <Pin className="h-4 w-4 text-primary mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{announcement.title}</h3>
                          <p className="text-muted-foreground mt-1">{announcement.content}</p>
                          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                            <span>By {announcement.author.displayName}</span>
                            <span>•</span>
                            <span>{announcement.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {canManage && (
            <>
              <TabsContent value="members" className="mt-0">
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Member management will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Community Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Community Description</label>
                        <p className="text-sm text-muted-foreground mt-1">Update your community description</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Privacy Settings</label>
                        <p className="text-sm text-muted-foreground mt-1">Manage who can join and post</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Moderation</label>
                        <p className="text-sm text-muted-foreground mt-1">Set up community rules and moderation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CommunityDetail;
