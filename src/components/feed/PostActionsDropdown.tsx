
import { useState } from 'react';
import { MoreHorizontal, Copy, UserX, Flag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Post } from '@/api/posts.api';

interface PostActionsDropdownProps {
  post: Post;
  isOwnPost?: boolean;
  onCopyLink: () => void;
  onMuteUser: () => void;
  onReportPost: () => void;
  onDeletePost?: () => void;
}

export function PostActionsDropdown({
  post,
  isOwnPost = false,
  onCopyLink,
  onMuteUser,
  onReportPost,
  onDeletePost
}: PostActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyLink();
    setIsOpen(false);
  };

  const handleMuteUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMuteUser();
    setIsOpen(false);
  };

  const handleReportPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReportPost();
    setIsOpen(false);
  };

  const handleDeletePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeletePost) {
      onDeletePost();
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-muted/80"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4 rotate-90 md:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copy link to post
        </DropdownMenuItem>
        
        {!isOwnPost && (
          <>
            <DropdownMenuItem onClick={handleMuteUser}>
              <UserX className="h-4 w-4 mr-2" />
              Mute @{post.author?.username || post.username}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleReportPost}>
              <Flag className="h-4 w-4 mr-2" />
              Report post
            </DropdownMenuItem>
          </>
        )}
        
        {isOwnPost && onDeletePost && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeletePost}
              className="text-destructive focus:text-destructive"
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
