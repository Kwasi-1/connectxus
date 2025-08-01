
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Comment as CommentType } from '@/types/global';

interface CommentProps {
  comment: CommentType;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
}

export function Comment({ comment, onLike, onReply }: CommentProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1);
    onLike?.(comment.id);
  };

  const handleReply = () => {
    onReply?.(comment.id);
  };

  return (
    <div className="border-b border-border p-4 hover:bg-muted/5 transition-colors">
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={comment.author.avatar || "/api/placeholder/48/48"} />
          <AvatarFallback>
            {comment.author.displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-bold text-foreground">{comment.author.displayName}</span>
            {comment.author.verified && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            )}
            <span className="text-muted-foreground">@{comment.author.username}</span>
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
              onClick={handleReply}
              className="h-auto p-0 hover:text-primary transition-colors"
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
        </div>
      </div>
    </div>
  );
}
