import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { getPostQuotesPaginated } from '@/api/posts.api';
import { Post } from '@/api/posts.api';
import { PostCard } from './PostCard';

interface QuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onQuote: (postId: string) => void;
  onShare: (postId: string) => void;
  onDelete?: (postId: string) => void;
  currentUserId?: string;
}

export function QuotesModal({
  isOpen,
  onClose,
  postId,
  onLike,
  onComment,
  onRepost,
  onQuote,
  onShare,
  onDelete,
  currentUserId,
}: QuotesModalProps) {
  const [quotes, setQuotes] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (isOpen) {
      setQuotes([]);
      setPage(1);
      setHasMore(true);
      loadQuotes(1);
    }
  }, [isOpen, postId]);

  const loadQuotes = async (pageNum: number) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await getPostQuotesPaginated(postId, {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      });

      if (pageNum === 1) {
        setQuotes(data);
      } else {
        setQuotes((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadQuotes(nextPage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-2xl p-0 max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold tracking-wider">Quoted by</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {quotes.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              No quotes yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {quotes.map((quote) => (
                <PostCard
                  key={quote.id}
                  post={quote}
                  onLike={onLike}
                  onComment={onComment}
                  onRepost={onRepost}
                  onQuote={onQuote}
                  onShare={onShare}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}

          {hasMore && quotes.length > 0 && (
            <div className="p-4 border-t border-border">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? 'Loading...' : 'Show more'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
