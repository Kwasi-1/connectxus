
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/feed/PostCard';
import { mockPosts } from '@/data/mockData';
import { ExploreTab } from '@/types/global';

const Explore = () => {
  const [activeTab, setActiveTab] = useState<ExploreTab>('for-you');

  const handleLike = (postId: string) => {
    console.log('Like post:', postId);
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleRepost = (postId: string) => {
    console.log('Repost:', postId);
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
              <div className="divide-y divide-border">
                {mockPosts.map((post) => (
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
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
              <div className="divide-y divide-border">
                {mockPosts.slice(0, 3).map((post) => (
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
