import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostCard } from '@/components/feed/PostCard';
import { mockPosts, mockUsers } from '@/data/mockData';
import { Post, User } from '@/types/global';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { CalendarDays, Link, Lock, LockOpen, Users } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  isPrivate: boolean;
  memberCount: number;
}

const CommunityDetail = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    // Mock community data
    const mockCommunity: Community = {
      id: communityId || '1',
      name: 'Tech Enthusiasts',
      description: 'A community for tech lovers to share ideas and projects.',
      avatar: '/api/placeholder/100/100',
      isPrivate: false,
      memberCount: 1234,
    };
    setCommunity(mockCommunity);

    // Mock posts data (filter posts for this community)
    const mockCommunityPosts = mockPosts.map(post => ({
      ...post,
      communityId: communityId || '1',
    })).slice(0, 5); // Limit to 5 posts for the example
    setPosts(mockCommunityPosts as Post[]);
  }, [communityId]);

  const createPost = (content: string): Post => {
    return {
      id: Date.now().toString(),
      author: mockUsers[0],
      content,
      images: content.includes('image') ? ['/api/placeholder/400/300'] : undefined,
      video: undefined,
      updatedAt: undefined,
      likes: 0,
      comments: 0,
      reposts: 0,
      quotes: 0,
      isLiked: false,
      isReposted: false,
      createdAt: new Date(),
    };
  };

  const handlePostSubmit = () => {
    if (newPostContent.trim()) {
      const newPost = createPost(newPostContent);
      setPosts([newPost, ...posts]);
      setNewPostContent('');
    }
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleRepost = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isReposted: !post.isReposted, reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1 }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleQuote = () => {
    console.log('Quote post');
  };

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        {/* Header */}
        <div className="bg-background/80 backdrop-blur-md border-b border-border p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={community?.avatar} alt={community?.name} />
              <AvatarFallback>{community?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{community?.name}</h1>
              <p className="text-muted-foreground">{community?.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  <Users className="h-4 w-4 inline-block mr-1" />
                  {community?.memberCount} Members
                </span>
                <span className="text-sm text-muted-foreground">
                  {community?.isPrivate ? (
                    <>
                      <Lock className="h-4 w-4 inline-block mr-1" />
                      Private
                    </>
                  ) : (
                    <>
                      <LockOpen className="h-4 w-4 inline-block mr-1" />
                      Public
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Composer */}
        <div className="p-4 border-b border-border">
          <div className="flex space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={mockUsers[0].avatar} alt={mockUsers[0].displayName} />
              <AvatarFallback>{mockUsers[0].displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Share something with this community..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="bg-muted/40 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
              />
              <div className="flex justify-end mt-2">
                <Button onClick={handlePostSubmit} disabled={!newPostContent.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onRepost={() => handleRepost(post.id)}
              onComment={() => handleComment(post.id)}
              onQuote={handleQuote}
              onShare={() => handleShare(post.id)}
            />
          ))}
          {posts.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CommunityDetail;
