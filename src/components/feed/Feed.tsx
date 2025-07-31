import { useState } from 'react';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { FeedHeader } from './FeedHeader';
import { Post } from '@/types/global';

interface FeedProps {
  posts: Post[];
  onCreatePost: (content: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onShare: (postId: string) => void;
}

export function Feed({ posts, onCreatePost, onLike, onComment, onRepost, onShare }: FeedProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'following'>('all');

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'following') {
      // In a real app, this would filter based on followed users
      return true; // For now, show all posts
    }
    return true;
  });

  return (
    <div className="flex-1 border-r border-border">
      <FeedHeader activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      {/* Post Composer */}
      <PostComposer onPost={onCreatePost} />
      
      {/* Posts */}
      <div className="divide-y divide-border">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={onLike}
            onComment={onComment}
            onRepost={onRepost}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  );
}