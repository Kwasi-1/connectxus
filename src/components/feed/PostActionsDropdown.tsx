
import { useState } from 'react';
import { MoreHorizontal, Link, VolumeX, Flag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Post } from '@/types/global';
import { useToast } from '@/hooks/use-toast';

interface PostActionsDropdownProps {
  post: Post;
  isOwnPost?: boolean;
  onDelete?: (postId: string) => void;
}

export function PostActionsDropdown({ post, isOwnPost = false, onDelete }: PostActionsDropdownProps) {
  const { toast } = useToast();

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    });
  };

  const handleMuteUser = () => {
    toast({
      title: "User muted",
      description: `You won't see posts from @${post.author.username}`,
    });
  };

  const handleReportPost = () => {
    toast({
      title: "Post reported",
      description: "Thank you for helping keep our community safe",
    });
  };

  const handleDeletePost = () => {
    if (onDelete) {
      onDelete(post.id);
      toast({
        title: "Post deleted",
        description: "Your post has been deleted",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-muted/80"
        >
          <MoreHorizontal className="h-4 w-4 rotate-90 md:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Link className="h-4 w-4 mr-2" />
          Copy link to post
        </DropdownMenuItem>
        {!isOwnPost && (
          <>
            <DropdownMenuItem onClick={handleMuteUser} className="cursor-pointer">
              <VolumeX className="h-4 w-4 mr-2" />
              Mute @{post.author.username}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReportPost} className="cursor-pointer">
              <Flag className="h-4 w-4 mr-2" />
              Report post
            </DropdownMenuItem>
          </>
        )}
        {isOwnPost && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeletePost} 
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete post
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
