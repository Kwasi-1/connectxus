import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Post } from "@/api/posts.api";
import { cn } from "@/lib/utils";
import moment from "moment";

interface QuotedPostCardProps {
  post: Post;
  onClick: () => void;
}

export function QuotedPostCard({ post, onClick }: QuotedPostCardProps) {
  const renderMedia = () => {
    const media = post.media || post.images;

    if (!media || media.length === 0) return null;

    const hasVideo = media.some((url) =>
      url.endsWith(".mp4") || url.endsWith(".mov") || url.endsWith(".webm")
    );

    if (hasVideo) {
      return (
        <div className="relative rounded-lg overflow-hidden border border-border mt-2">
          <video
            className="w-full h-32 object-cover"
            controls={false}
          >
            <source src={media[0]} type="video/mp4" />
          </video>
        </div>
      );
    }

    if (media.length === 1) {
      return (
        <div className="mt-2">
          <div className="rounded-lg overflow-hidden border border-border">
            <img
              src={media[0]}
              alt="Post content"
              className="w-full h-32 object-cover"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border border-border">
          {media.slice(0, 4).map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Post content ${index + 1}`}
              className="w-full h-16 object-cover"
            />
          ))}
        </div>
      </div>
    );
  };

  const authorDisplayName =
    post.author?.full_name || post.full_name || post.author?.username || post.username || "Unknown";
  const authorUsername = post.author?.username || post.username || "unknown";
  const authorAvatar = post.author?.avatar || post.author_avatar || "/api/placeholder/24/24";
  const authorVerified = post.author?.verified || post.author_verified || false;

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="border border-border rounded-xl p-3 mt-3 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="flex space-x-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={authorAvatar} />
          <AvatarFallback className="text-xs">
            {getInitials(authorDisplayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-sm text-foreground truncate">
              {authorDisplayName}
            </span>
            {authorVerified && (
              <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            )}
            <span className="text-muted-foreground text-sm">
              @{authorUsername}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {moment(post.created_at || (post as any).createdAt).fromNow()}
            </span>
          </div>

          <div className="text-sm text-foreground mt-1 line-clamp-3">
            {post.content}
          </div>

          {renderMedia()}
        </div>
      </div>
    </div>
  );
}
