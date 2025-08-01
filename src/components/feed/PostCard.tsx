
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Post } from '@/types/global';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onShare: (postId: string) => void;
  detailed?: boolean;
}

export function PostCard({ post, onLike, onComment, onRepost, onShare, detailed = false }: PostCardProps) {
  const navigate = useNavigate();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements or if in detailed view
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || detailed) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  const handleInteractionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card 
      className={cn(
        "border-b border-border p-4 transition-colors",
        !detailed && "hover:bg-hover/50 cursor-pointer"
      )}
      onClick={handlePostClick}
    >
      <div className="flex space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={post.author.avatar || "/api/placeholder/48/48"} />
          <AvatarFallback>
            {post.author.displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground">{post.author.displayName}</span>
            {post.author.verified && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            )}
            <span className="text-muted-foreground">@{post.author.username}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="text-foreground whitespace-pre-wrap">{post.content}</div>
          
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-border">
              <img 
                src={post.images[0]} 
                alt="Post content" 
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          {/* Interaction Buttons */}
          <div className="flex items-center justify-between max-w-md pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onComment(post.id))}
              className="flex items-center space-x-2 text-muted-foreground hover:text-interaction-comment hover:bg-interaction-comment/10 p-2 rounded-full"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{post.comments || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onRepost(post.id))}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-full",
                post.isReposted 
                  ? "text-interaction-repost bg-interaction-repost/10" 
                  : "text-muted-foreground hover:text-interaction-repost hover:bg-interaction-repost/10"
              )}
            >
              <Repeat2 className="h-5 w-5" />
              <span className="text-sm">{post.reposts || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onLike(post.id))}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-full",
                post.isLiked 
                  ? "text-interaction-like bg-interaction-like/10" 
                  : "text-muted-foreground hover:text-interaction-like hover:bg-interaction-like/10"
              )}
            >
              <Heart className={cn("h-5 w-5", post.isLiked && "fill-current")} />
              <span className="text-sm">{post.likes || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onShare(post.id))}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-full"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
