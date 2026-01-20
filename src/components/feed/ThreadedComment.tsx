import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MoreHorizontal, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Comment as CommentType } from "@/types/global";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface ThreadedCommentProps {
  comment: CommentType;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  depth?: number;
  maxDepth?: number;
  isLastChild?: boolean;
}

export function ThreadedComment({
  comment,
  onLike,
  onReply,
  depth = 0,
  maxDepth = 5,
  isLastChild = false,
}: ThreadedCommentProps) {
  const { user: authUser } = useAuth();
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false); // Hidden by default

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
      setShowReplies(true);
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
      const distance = formatDistanceToNow(new Date(date), {
        addSuffix: false,
      });
      // Shorten the format like Instagram (e.g., "2h", "3d", "1w")
      return distance
        .replace(" seconds", "s")
        .replace(" second", "s")
        .replace(" minutes", "m")
        .replace(" minute", "m")
        .replace(" hours", "h")
        .replace(" hour", "h")
        .replace(" days", "d")
        .replace(" day", "d")
        .replace(" weeks", "w")
        .replace(" week", "w")
        .replace(" months", "mo")
        .replace(" month", "mo")
        .replace(" years", "y")
        .replace(" year", "y")
        .replace("about ", "")
        .replace("less than a", "<1")
        .replace("over ", "");
    } catch {
      return "now";
    }
  };

  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;
  const repliesCount = comment.repliesCount || replies.length;

  // Thread line logic
  const showThreadLine = hasReplies && showReplies;

  return (
    <div className="relative">
      {/* Main comment row */}
      <div className={cn("flex gap-3 py-3", depth > 0 && "ml-12")}>
        {/* Avatar column with thread line */}
        <div className="relative flex flex-col items-center">
          <Avatar
            className={cn(
              "shrink-0 z-10",
              depth === 0 ? "w-10 h-10" : "w-9 h-9"
            )}
          >
            <AvatarImage src={authorAvatar} />
            <AvatarFallback className="text-sm bg-muted text-muted-foreground">
              {getInitials(authorDisplayName)}
            </AvatarFallback>
          </Avatar>

          {/* Thread line extending down from avatar */}
          {showThreadLine && (
            <div className="w-0.5 bg-border flex-1 mt-2 min-h-[20px]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span
                className="font-semibold text-[15px] text-foreground hover:opacity-70 cursor-pointer truncate"
                onClick={() => {
                  /* Navigate to profile */
                }}
              >
                {authorUsername}
              </span>
              {authorVerified && (
                <svg
                  className="w-4 h-4 text-primary shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
              <span className="text-sm text-muted-foreground shrink-0">
                · {formatTimeAgo(comment.createdAt)}
              </span>
            </div>

            {/* More options */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Comment content */}
          <p className="text-[15px] text-foreground mt-1 whitespace-pre-wrap break-words leading-relaxed">
            {comment.content}
          </p>

          {/* Actions - Instagram/Threads style */}
          <div className="flex items-center gap-4 mt-3">
            {/* Like */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 group/like"
            >
              <Heart
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground group-hover/like:text-foreground"
                )}
              />
              {likes > 0 && (
                <span
                  className={cn(
                    "text-sm",
                    isLiked ? "text-red-500" : "text-muted-foreground"
                  )}
                >
                  {likes}
                </span>
              )}
            </button>

            {/* Reply */}
            {depth < maxDepth && (
              <button
                onClick={handleReplyClick}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Reply
              </button>
            )}

            {/* View replies toggle */}
            {hasReplies && !showReplies && (
              <button
                onClick={() => setShowReplies(true)}
                className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                View {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={authUser?.avatar} />
                <AvatarFallback className="text-xs bg-muted">
                  {authUser?.name?.substring(0, 1) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
                <input
                  type="text"
                  placeholder={`Reply to ${authorUsername}...`}
                  className="flex-1 text-sm bg-transparent text-foreground placeholder-muted-foreground outline-none min-w-0"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={isSubmittingReply}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitReply();
                    }
                    if (e.key === "Escape") {
                      setShowReplyInput(false);
                      setReplyContent("");
                    }
                  }}
                />
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmittingReply}
                  title="Send reply"
                  className={cn(
                    "text-primary transition-opacity",
                    (!replyContent.trim() || isSubmittingReply) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies with connecting line */}
      {hasReplies && showReplies && (
        <div className="relative">
          {/* Connecting line from parent */}
          {depth === 0 && (
            <div className="absolute left-5 top-0 w-0.5 bg-border h-3" />
          )}

          <div className={cn(depth > 0 && "ml-12")}>
            {replies.map((reply, index) => (
              <ThreadedComment
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                depth={depth + 1}
                maxDepth={maxDepth}
                isLastChild={index === replies.length - 1}
              />
            ))}
          </div>

          {/* Hide replies button */}
          {repliesCount > 0 && (
            <button
              onClick={() => setShowReplies(false)}
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 mb-2",
                depth === 0 ? "ml-[52px]" : "ml-12"
              )}
            >
              Hide replies
            </button>
          )}
        </div>
      )}
    </div>
  );
}
