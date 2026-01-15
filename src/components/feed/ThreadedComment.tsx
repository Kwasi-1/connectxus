import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Comment as CommentType } from "@/types/global";
import { formatDistanceToNow } from "date-fns";

interface ThreadedCommentProps {
  comment: CommentType;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  depth?: number;
  maxDepth?: number;
}

export function ThreadedComment({
  comment,
  onLike,
  onReply,
  depth = 0,
  maxDepth = 5,
}: ThreadedCommentProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels

  useEffect(() => {
    setIsLiked(comment.isLiked);
    setLikes(comment.likes);
  }, [comment.isLiked, comment.likes]);

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prev) => (newIsLiked ? prev + 1 : prev - 1));
    onLike?.(comment.id);
  };

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
    setReplyContent("");
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return;

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyInput(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const authorDisplayName =
    comment.author?.displayName || comment.author?.username || "Unknown";
  const authorUsername = comment.author?.username || "unknown";
  const authorAvatar = comment.author?.avatar;
  const authorVerified = comment.author?.verified || false;

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;
  const repliesCount = comment.repliesCount || replies.length;

  // YouTube-style avatar size decreases with depth
  const avatarSizeClass = depth === 0 ? "w-10 h-10" : "w-8 h-8";
  const indentClass = depth > 0 ? "ml-12" : "";

  return (
    <div className={cn("py-3", depth === 0 && "border-b border-border/50")}>
      <div className={cn("flex gap-3", indentClass)}>
        {/* Avatar */}
        <Avatar className={cn(avatarSizeClass, "shrink-0")}>
          <AvatarImage src={authorAvatar} />
          <AvatarFallback className="text-xs bg-muted">
            {getInitials(authorDisplayName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer">
              @{authorUsername}
            </span>
            {authorVerified && (
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-[10px]">✓</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Comment Text */}
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions Row - YouTube Style */}
          <div className="flex items-center gap-1 mt-2">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-8 px-2 hover:bg-muted rounded-full gap-1.5",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              {likes > 0 && <span className="text-xs">{likes}</span>}
            </Button>

            {/* Reply Button */}
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplyClick}
                className={cn(
                  "h-8 px-3 hover:bg-muted rounded-full text-xs font-medium",
                  showReplyInput && "bg-muted"
                )}
              >
                Reply
              </Button>
            )}

            {/* More Options */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted rounded-full ml-auto"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Reply Input - YouTube Style */}
          {showReplyInput && (
            <div className="mt-3 flex gap-3">
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback className="text-[10px] bg-muted">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`Reply to @${authorUsername}...`}
                  className="w-full px-0 py-2 text-sm bg-transparent text-foreground placeholder-muted-foreground border-b border-muted-foreground/30 focus:border-foreground outline-none transition-colors"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={isSubmittingReply}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitReply();
                    }
                  }}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReplyClick}
                    disabled={isSubmittingReply}
                    className="h-8 px-4 rounded-full text-sm font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isSubmittingReply}
                    className="h-8 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmittingReply ? "Replying..." : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View Replies Toggle - YouTube Style */}
          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="h-8 px-3 mt-2 hover:bg-primary/10 rounded-full text-primary font-medium text-sm gap-1"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="mt-2">
          {replies.map((reply) => (
            <ThreadedComment
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
