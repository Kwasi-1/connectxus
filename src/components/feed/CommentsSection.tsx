import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Comment } from './Comment';
import { getPostCommentsPaginated, toggleLikeComment } from '@/api/posts.api';
import { Comment as CommentType } from '@/api/posts.api';
import { Loader2 } from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
  onReply?: (commentId: string, content: string) => void;
}

export function CommentsSection({ postId, onReply }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    loadInitialComments();
  }, [postId]);

  const loadInitialComments = async () => {
    setIsLoading(true);
    try {
      const data = await getPostCommentsPaginated(postId, {
        limit: 3,
        page: 1,
      });

      setComments(data);
      setPage(1);
      setHasMore(data.length === 3);
      setInitialLoadDone(true);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getPostCommentsPaginated(postId, {
        limit: 10,
        page: nextPage,
      });

      setComments((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === 10);
    } catch (error) {
      console.error('Failed to load more comments:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const result = await toggleLikeComment(commentId);

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes_count: result.likes_count,
                is_liked: !comment.is_liked,
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!initialLoadDone || comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="divide-y divide-border">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={{
              id: comment.id,
              content: comment.content,
              author: comment.author || {
                id: comment.author_id,
                username: comment.username || 'user',
                displayName: comment.full_name || 'User',
                avatar: comment.avatar || null,
                verified: comment.author_verified || false,
              },
              likes: comment.likes_count || 0,
              isLiked: comment.is_liked || false,
              repliesCount: comment.replies_count || 0,
              createdAt: comment.created_at || new Date().toISOString(),
            }}
            onLike={handleLikeComment}
            onReply={onReply}
          />
        ))}
      </div>

      {hasMore && (
        <div className="pt-4 pb-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-primary hover:text-primary hover:bg-primary/10"
            onClick={loadMoreComments}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more comments...
              </>
            ) : (
              `Load more comments (10)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
