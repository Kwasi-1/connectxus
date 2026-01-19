
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Comment as CommentType } from '@/types/global';
import { getCommentReplies } from '@/api/posts.api';
import { toast } from 'sonner';
import { CommentLikesModal } from './CommentLikesModal';

interface CommentProps {
  comment: CommentType;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  depth?: number; 
}

export function Comment({ comment, onLike, onReply, depth = 0 }: CommentProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);

  const [showLikesModal, setShowLikesModal] = useState(false);

  useEffect(() => {
    setIsLiked(comment.isLiked);
    setLikes(comment.likes);
  }, [comment.isLiked, comment.likes]);

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1);
    onLike?.(comment.id);
  };

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
    setReplyContent('');
  };

  const loadReplies = async (page: number = 1) => {
    if (depth > 0) return; 

    setLoadingReplies(true);
    try {
      const fetchedReplies = await getCommentReplies(comment.id, {
        page,
        limit: 10,
      });

      const transformedReplies = fetchedReplies.map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        author: {
          id: reply.author_id,
          username: reply.username || 'user',
          displayName: reply.full_name || 'User',
          avatar: reply.avatar || null,
          verified: reply.author_verified || false,
        },
        likes: reply.likes_count || 0,
        isLiked: reply.is_liked || false,
        createdAt: reply.created_at || new Date().toISOString(),
      }));

      if (page === 1) {
        setReplies(transformedReplies);
      } else {
        setReplies([...replies, ...transformedReplies]);
      }

      setHasMoreReplies(fetchedReplies.length === 10);
      setRepliesPage(page);
    } catch (error) {
      console.error('Error loading replies:', error);
      toast.error('Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleToggleReplies = async () => {
    if (!showReplies) {
      setShowReplies(true);
      if (replies.length === 0) {
        await loadReplies(1);
      }
    } else {
      setShowReplies(false);
    }
  };

  const handleLoadMoreReplies = async () => {
    await loadReplies(repliesPage + 1);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return;

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);

      if (showReplies) {
        await loadReplies(1);
      }
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const authorDisplayName = comment.author?.displayName || comment.author?.username || 'Unknown';
  const authorUsername = comment.author?.username || 'unknown';
  const authorAvatar = comment.author?.avatar || "/api/placeholder/48/48";
  const authorVerified = comment.author?.verified || false;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="border-b border-border/80 p-4 hover:bg-muted/5 transition-colors">
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={authorAvatar} />
          <AvatarFallback>
            {getInitials(authorDisplayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-bold text-foreground">{authorDisplayName}</span>
            {authorVerified && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            )}
            <span className="text-muted-foreground">@{authorUsername}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center space-x-6 mt-3 text-muted-foreground">
            {/* Only allow replies on top-level comments (depth = 0) */}
            {depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplyClick}
                className={cn(
                  "h-auto p-0 hover:text-primary transition-colors",
                  showReplyInput && "text-primary"
                )}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Reply</span>
              </Button>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "h-auto p-0 hover:text-red-500 transition-colors",
                  isLiked && "text-red-500"
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              </Button>
              <button
                onClick={() => likes > 0 && setShowLikesModal(true)}
                className={cn(
                  "text-sm hover:underline transition-colors",
                  likes > 0 && "cursor-pointer hover:text-red-500"
                )}
                disabled={likes === 0}
              >
                {likes}
              </button>
            </div>
          </div>

          {showReplyInput && (
            <div className="mt-3 ml-0">
              <textarea
                placeholder={`Reply to @${authorUsername}...`}
                className="w-full px-3 py-2 text-sm bg-muted/30 text-foreground placeholder-muted-foreground resize-none border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={isSubmittingReply}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReplyClick}
                  disabled={isSubmittingReply}
                  className="text-sm px-3 py-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmittingReply}
                  className="bg-foreground text-primary-foreground px-3 py-1 text-sm rounded-full font-bold hover:bg-foreground/90 disabled:opacity-50"
                >
                  {isSubmittingReply ? 'Replying...' : 'Reply'}
                </Button>
              </div>
            </div>
          )}

          {/* View Replies Button (only for top-level comments with replies) */}
          {depth === 0 && comment.repliesCount && comment.repliesCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleReplies}
              className="mt-2 h-auto p-0 text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showReplies && "rotate-180"
                )}
              />
              <span className="text-sm">
                {showReplies
                  ? 'Hide replies'
                  : `View ${comment.repliesCount} ${comment.repliesCount === 1 ? 'reply' : 'replies'}`}
              </span>
            </Button>
          )}

          {/* Render loaded replies */}
          {depth === 0 && showReplies && (
            <div className="mt-3 ml-6 space-y-0 border-l-2 border-border/50 pl-4">
              {loadingReplies && replies.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {replies.map((reply) => (
                    <Comment
                      key={reply.id}
                      comment={reply}
                      onLike={onLike}
                      onReply={onReply}
                      depth={1}
                    />
                  ))}

                  {/* Load More Replies Button */}
                  {hasMoreReplies && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadMoreReplies}
                      disabled={loadingReplies}
                      className="mt-2 h-auto p-0 text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      {loadingReplies ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Loading...</span>
                        </>
                      ) : (
                        <span className="text-sm">Load more replies</span>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comment Likes Modal */}
      <CommentLikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        commentId={comment.id}
      />
    </div>
  );
}
