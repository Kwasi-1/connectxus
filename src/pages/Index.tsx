import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { Feed } from '@/components/feed/Feed';
import { mockPosts, mockTrendingTopics, mockCampusHighlights, mockUsers } from '@/data/mockData';
import { Post } from '@/types/global';

const Index = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleCreatePost = (content: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: mockUsers[0], // Current user
      content,
      likes: 0,
      comments: 0,
      reposts: 0,
      isLiked: false,
      isReposted: false,
      createdAt: new Date(),
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    // Stub for comment functionality
    console.log('Comment on post:', postId);
  };

  const handleRepost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isReposted: !post.isReposted, 
            reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1 
          }
        : post
    ));
  };

  const handleShare = (postId: string) => {
    // Stub for share functionality
    console.log('Share post:', postId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activeTab="home" />
        </div>
        
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          <Feed
            posts={posts}
            onCreatePost={handleCreatePost}
            onLike={handleLike}
            onComment={handleComment}
            onRepost={handleRepost}
            onShare={handleShare}
          />
        </div>
        
        {/* Right Sidebar - Hidden on mobile and tablet */}
        <div className="hidden xl:block">
          <RightSidebar 
            trendingTopics={mockTrendingTopics}
            campusHighlights={mockCampusHighlights}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
