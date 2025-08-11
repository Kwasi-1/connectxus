import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHeader } from '@/components/account/ProfileHeader';
import { ProfileTabs } from '@/components/account/ProfileTabs';
import { mockUserProfile, mockPosts } from '@/data/mockData';
import { UserProfile as UserProfileType } from '@/types/global';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      
      // Find the user from mock posts data based on userId
      const foundPost = mockPosts.find(post => post.author.id === userId);
      if (foundPost) {
        // Create user profile from found user
        const userProfile: UserProfileType = {
          ...foundPost.author,
          posts: mockPosts.filter(post => post.author.id === userId),
          joinedGroups: [],
          tutoringRequests: []
        };
        setUser(userProfile);
      } else {
        // Fallback to mock profile if user not found in posts
        setUser(mockUserProfile);
      }
      
      setIsLoading(false);
    };

    fetchUserProfile();
  }, [userId]);

  const handleLike = (postId: string) => {
    if (!user) return;
    const updatedPosts = user.posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    );
    setUser({ ...user, posts: updatedPosts });
  };

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: string) => {
    if (!user) return;
    const updatedPosts = user.posts.map(post => 
      post.id === postId 
        ? { ...post, isReposted: !post.isReposted, reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1 }
        : post
    );
    setUser({ ...user, posts: updatedPosts });
  };

  const handleQuote = (postId: string) => {
    console.log('Quote post:', postId);
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
  };

  const handleMediaClick = (post: any) => {
    console.log('Media clicked:', post);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner/>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">User not found</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleUserUpdate = (updatedUser: UserProfileType) => {
    setUser(updatedUser);
  };

  return (
    <AppLayout>
      <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full">
        <div className='hidden px-2 py-4 sticky top-16 lg:top-0 bg-background z-50 md:flex items-center gap-2 border-b'>
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon icon="line-md:arrow-left" className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{user?.displayName}</h1>
        </div>
        <ProfileHeader user={user!} onUserUpdate={handleUserUpdate} isOwnProfile={false} />
        <ProfileTabs 
          user={user!} 
          isOwnProfile={false} 
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onQuote={handleQuote}
          onShare={handleShare}
          onMediaClick={handleMediaClick}
        />
      </div>
    </AppLayout>
  );
};

export default UserProfile;
