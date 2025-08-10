
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Post } from '@/types/global';
import { cn } from '@/lib/utils';

interface QuotedPostCardProps {
  post: Post;
  onClick: () => void;
}

export function QuotedPostCard({ post, onClick }: QuotedPostCardProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderMedia = () => {
    if (post.video) {
      return (
        <div className="relative rounded-lg overflow-hidden border border-border mt-2">
          <video 
            className="w-full h-32 object-cover"
            poster={post.images?.[0]}
            controls={false}
          >
            <source src={post.video} type="video/mp4" />
          </video>
        </div>
      );
    }

    if (post.images && post.images.length > 0) {
      return (
        <div className="mt-2">
          {post.images.length === 1 ? (
            <div className="rounded-lg overflow-hidden border border-border">
              <img 
                src={post.images[0]} 
                alt="Post content" 
                className="w-full h-32 object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border border-border">
              {post.images.slice(0, 4).map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Post content ${index + 1}`} 
                  className="w-full h-16 object-cover"
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
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
          <AvatarImage src={post.author.avatar || "/api/placeholder/24/24"} />
          <AvatarFallback className="text-xs">
            {post.author.displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-sm text-foreground truncate">
              {post.author.displayName}
            </span>
            {post.author.verified && (
              <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            )}
            <span className="text-muted-foreground text-sm">
              @{post.author.username}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {formatTimeAgo(post.createdAt)}
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
