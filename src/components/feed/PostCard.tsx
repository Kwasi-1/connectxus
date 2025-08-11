import { Heart, MessageCircle, Repeat2, Share, Play, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Post } from '@/types/global';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { PostActionsDropdown } from './PostActionsDropdown';
import { QuotedPostCard } from './QuotedPostCard';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onQuote: (postId: string) => void;
  onShare: (postId: string) => void;
  onMediaClick?: (post: Post) => void;
  detailed?: boolean;
  currentUserId?: string;
}

export function PostCard({ 
  post, 
  onLike, 
  onComment, 
  onRepost, 
  onQuote,
  onShare, 
  onMediaClick,
  detailed = false,
  currentUserId = '1'
}: PostCardProps) {
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

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author.id}`);
  };

  const handleInteractionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMediaClick) {
      onMediaClick(post);
    }
  };

  const handleQuotedPostClick = () => {
    if (post.quotedPost) {
      navigate(`/post/${post.quotedPost.id}`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
  };

  const handleMuteUser = () => {
    console.log('Mute user:', post.author.username);
  };

  const handleReportPost = () => {
    console.log('Report post:', post.id);
  };

  const handleDeletePost = () => {
    console.log('Delete post:', post.id);
  };

  const isOwnPost = post.author.id === currentUserId;

  const renderMedia = () => {
    if (post.video) {
      return (
        <div className="relative rounded-2xl overflow-hidden border border-border mt-3">
          <video 
            className="w-full h-auto max-h-96 object-cover cursor-pointer"
            poster={post.images?.[0]}
            controls={false}
            onClick={handleMediaClick}
          >
            <source src={post.video} type="video/mp4" />
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors cursor-pointer" onClick={handleMediaClick}>
            <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors">
              <Play className="h-6 w-6 text-black fill-current" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            0:59
          </div>
        </div>
      );
    }

    if (post.images && post.images.length > 0) {
      return (
        <div className="mt-3">
          {post.images.length === 1 ? (
            <div className="rounded-2xl overflow-hidden border border-border">
              <img 
                src={post.images[0]} 
                alt="Post content" 
                className="w-full h-auto max-h-96 object-cover hover:brightness-95 transition-all cursor-pointer"
                onClick={handleMediaClick}
              />
            </div>
          ) : post.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-border">
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Post content ${index + 1}`} 
                  className="w-full h-48 sm:h-64 md:-72 object-cover hover:brightness-95 transition-all cursor-pointer"
                  onClick={handleMediaClick}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-border">
              <img 
                src={post.images[0]} 
                alt="Post content 1" 
                className="w-full h-48 object-cover hover:brightness-95 transition-all cursor-pointer"
                onClick={handleMediaClick}
              />
              <div className="grid gap-1">
                {post.images.slice(1, 3).map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`Post content ${index + 2}`} 
                    className="w-full h-24 sm:h-32 md:h-40 object-cover hover:brightness-95 transition-all cursor-pointer"
                    onClick={handleMediaClick}
                  />
                ))}
                {post.images.length > 3 && (
                  <div className="relative">
                    <img 
                      src={post.images[3]} 
                      alt="Post content 4" 
                      className="w-full h-24 object-cover cursor-pointer"
                      onClick={handleMediaClick}
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg cursor-pointer" onClick={handleMediaClick}>
                      +{post.images.length - 3}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card 
      className={cn(
        "border-b border-border rounded-none border-0 p-4 transition-colors cursor-pointer",
        detailed ? "hover:bg-transparent" : "hover:bg-muted/5"
      )}
      onClick={handlePostClick}
    >
      <div className="flex space-x-3">
        <Avatar className={detailed ? "w-11 h-11" : "w-10 h-10"} onClick={handleUserClick}>
          <AvatarImage src={post.author.avatar || "/api/placeholder/48/48"} />
          <AvatarFallback>
            {post.author.displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start md:items-center justify-between space-x-2 flex-wrap">
            <div className='flex items-start justify-center space-x-2 flex-wrap'>
              <div className='flex flex-col md:flex-row items-start md:items-center gap-x-2'>
                <div className='flex gap-2 items-start'>
                  <span 
                    className="font-bold text-foreground hover:underline cursor-pointer"
                    onClick={handleUserClick}
                  >
                    {post.author.displayName}
                  </span>
                  {post.author.verified && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
                <span 
                  className="text-muted-foreground hover:underline cursor-pointer"
                  onClick={handleUserClick}
                >
                  @{post.author.username}
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground hover:underline cursor-pointer">
                {detailed ? new Date(post.createdAt).toLocaleDateString() : formatTimeAgo(post.createdAt)}
              </span>
            </div>
            <div className="ml-auto">
              <PostActionsDropdown
                post={post}
                isOwnPost={isOwnPost}
                onCopyLink={handleCopyLink}
                onMuteUser={handleMuteUser}
                onReportPost={handleReportPost}
                onDeletePost={isOwnPost ? handleDeletePost : undefined}
              />
            </div>
          </div>

          <div className={detailed ? '-ml-12 mt-3 md:mt-6' : ''}>
          
          <div className={cn(
            "text-foreground whitespace-pre-wrap mt-1",
            detailed ? "text-base md:text-lg leading-relaxed" : "text-base"
          )}>
            {post.content}
          </div>
          
          {renderMedia()}
          
          {post.quotedPost && (
            <QuotedPostCard 
              post={post.quotedPost} 
              onClick={handleQuotedPostClick}
            />
          )}
          
          <div className={cn(
            "flex items-center justify-between pt-3",
            detailed ? "max-w-lg border-t border-border mt-4 pt-4" : "max-w-md"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onComment(post.id))}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-full group"
            >
              <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{post.comments || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onRepost(post.id))}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-full group",
                post.isReposted 
                  ? "text-green-500 bg-green-500/10" 
                  : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
              )}
            >
              <Repeat2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{post.reposts || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onLike(post.id))}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-full group",
                post.isLiked 
                  ? "text-red-500 bg-red-500/10" 
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              )}
            >
              <Heart className={cn(
                "h-5 w-5 group-hover:scale-110 transition-transform",
                post.isLiked && "fill-current"
              )} />
              <span className="text-sm">{post.likes || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onQuote(post.id))}
              className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 p-2 rounded-full group"
            >
              <Quote className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{post.quotes || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleInteractionClick(e, () => onShare(post.id))}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-full group"
            >
              <Share className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
