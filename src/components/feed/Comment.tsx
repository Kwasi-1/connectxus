
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Comment as CommentType } from '@/types/global';

interface CommentProps {
  comment: CommentType;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  isReplyMode?: boolean;
}

export function Comment({ comment, onLike, onReply, isReplyMode = false }: CommentProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return;

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-auto p-0 hover:text-red-500 transition-colors",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4 mr-1", isLiked && "fill-current")} />
              <span className="text-sm">{likes}</span>
            </Button>
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
        </div>
      </div>
    </div>
  );
}
