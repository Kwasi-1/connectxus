
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/feed/PostCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { mockPosts } from '@/data/mockData';
import { ExploreTab, Post } from '@/types/global';

const Explore = () => {
  const [activeTab, setActiveTab] = useState<ExploreTab>('for-you');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate API call with useEffect
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter posts based on active tab
      let filteredPosts = mockPosts;
      if (activeTab === 'trending') {
        filteredPosts = mockPosts.slice(0, 3);
      }
      
      setPosts(filteredPosts);
      setLoading(false);
    };

    fetchPosts();
  }, [activeTab]);

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
    console.log('Share post:', postId);
  };

  return (
    <AppLayout>
      <div className="border-r border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-foreground">Explore</h1>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ExploreTab)}>
            <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-none">
              <TabsTrigger 
                value="for-you" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                For you
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Trending
              </TabsTrigger>
              <TabsTrigger 
                value="news" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                News
              </TabsTrigger>
              <TabsTrigger 
                value="sports" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Sports
              </TabsTrigger>
              <TabsTrigger 
                value="entertainment" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Entertainment
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="for-you" className="mt-0">
              {loading ? (
                <LoadingSpinner size="lg" />
              ) : (
                <div className="divide-y divide-border">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onRepost={handleRepost}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
              {loading ? (
                <LoadingSpinner size="lg" />
              ) : (
                <div className="divide-y divide-border">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onRepost={handleRepost}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="news" className="mt-0">
              <div className="p-8 text-center">
                <p className="text-muted-foreground">News content coming soon...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="sports" className="mt-0">
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Sports content coming soon...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="entertainment" className="mt-0">
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Entertainment content coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
