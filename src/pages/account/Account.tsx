
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHeader } from '@/components/account/ProfileHeader';
import { ProfileTabs } from '@/components/account/ProfileTabs';
import { mockUserProfile } from '@/data/mockData';
import { UserProfile } from '@/types/global';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile>(mockUserProfile);

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleLike = (postId: string) => {
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

  return (
    <AppLayout>
      <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full">
        <div className='hidden px-2 py-4 sticky top-16 lg:top-0 bg-background z-50 md:flex items-center gap-2 border-b'>
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon icon="line-md:arrow-left" className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{user.displayName}</h1>
        </div>
        <ProfileHeader user={user} onUserUpdate={handleUserUpdate} />
        <ProfileTabs 
          user={user} 
          isOwnProfile={true}
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

export default Account;
