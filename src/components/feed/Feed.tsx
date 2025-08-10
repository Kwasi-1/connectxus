
import { useState, useEffect } from 'react';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { FeedHeader } from './FeedHeader';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { QuotePostModal } from './QuotePostModal';
import { Post } from '@/types/global';
import { useNavigate } from 'react-router-dom';

interface FeedProps {
  posts: Post[];
  onCreatePost: (content: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onQuote: (content: string, quotedPost: Post) => void;
  onShare: (postId: string) => void;
  onMediaClick: (post: Post) => void;
  loading?: boolean;
}

export function Feed({ posts, onCreatePost, onLike, onComment, onRepost, onQuote, onShare, onMediaClick, loading = false }: FeedProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'for-you' | 'following' | 'university'>('for-you');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedPostForQuote, setSelectedPostForQuote] = useState<Post | null>(null);

  const handleMobilePostClick = () => {
    navigate('/compose');
  };

  const handleQuoteClick = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForQuote(post);
      setQuoteModalOpen(true);
    }
  };

  const handleQuoteSubmit = (content: string, quotedPost: Post) => {
    onQuote(content, quotedPost);
    setQuoteModalOpen(false);
    setSelectedPostForQuote(null);
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'following') {
      return true;
    }
    if (activeFilter === 'university') {
      return post.content.toLowerCase().includes('university') || 
             post.content.toLowerCase().includes('campus') ||
             post.content.toLowerCase().includes('tech university');
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 border-l xl:border-l-0 border-r border-border min-h-screen">
        <FeedHeader activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <PostComposer onPost={onCreatePost} />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1">
        <FeedHeader activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <div className='min-h-screen border-l xl:border-l-0 border-r border-border'>     
        <PostComposer onPost={onCreatePost} />
        
        <div className="divide-y divide-border">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={onLike}
              onComment={onComment}
              onRepost={onRepost}
              onQuote={handleQuoteClick}
              onShare={onShare}
              onMediaClick={onMediaClick}
            />
          ))}
          {filteredPosts.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No posts found for this filter.</p>
            </div>
          )}
        </div>
        </div>

        <FloatingActionButton onClick={handleMobilePostClick} />
      </div>

      {selectedPostForQuote && (
        <QuotePostModal
          isOpen={quoteModalOpen}
          onClose={() => {
            setQuoteModalOpen(false);
            setSelectedPostForQuote(null);
          }}
          post={selectedPostForQuote}
          onQuote={handleQuoteSubmit}
        />
      )}
    </>
  );
}
