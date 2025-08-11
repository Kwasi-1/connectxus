import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/feed/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProfile, Post } from '@/types/global';

interface ProfileTabsProps {
  user: UserProfile;
  isOwnProfile: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onQuote: (postId: string) => void;
  onShare: (postId: string) => void;
  onMediaClick: (post: Post) => void;
}

export function ProfileTabs({ 
  user, 
  isOwnProfile, 
  onLike, 
  onComment, 
  onRepost, 
  onQuote,
  onShare, 
  onMediaClick 
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent h-auto">
        <TabsTrigger 
          value="posts" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent font-medium py-4"
        >
          Posts
        </TabsTrigger>
        <TabsTrigger 
          value="replies" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent font-medium py-4"
        >
          Replies
        </TabsTrigger>
        <TabsTrigger 
          value="media" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent font-medium py-4"
        >
          Media
        </TabsTrigger>
        <TabsTrigger 
          value="likes" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent font-medium py-4"
        >
          Likes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-0">
        <div className="divide-y divide-border">
          {user.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={onLike}
              onComment={onComment}
              onRepost={onRepost}
              onQuote={onQuote}
              onShare={onShare}
              onMediaClick={onMediaClick}
            />
          ))}
          {user.posts.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="replies" className="mt-0">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No replies yet</p>
        </div>
      </TabsContent>
      
      <TabsContent value="media" className="mt-0">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No media yet</p>
        </div>
      </TabsContent>
      
      <TabsContent value="likes" className="mt-0">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No likes yet</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
