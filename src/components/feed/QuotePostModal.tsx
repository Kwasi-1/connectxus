
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { QuotedPostCard } from './QuotedPostCard';
import { Post } from '@/types/global';
import { useAuth } from '@/contexts/AuthContext';

interface QuotePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onQuote: (content: string, quotedPost: Post) => void;
}

export function QuotePostModal({ isOpen, onClose, post, onQuote }: QuotePostModalProps) {
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const maxChars = 280;

  const handleQuote = () => {
    if (content.length <= maxChars) {
      onQuote(content.trim(), post);
      setContent('');
      onClose();
    }
  };

  const isDisabled = content.length > maxChars || content.trim().length === 0;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const userDisplayName = user?.full_name || user?.username || 'Unknown';
  const userAvatar = user?.avatar || undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] lg:max-w-xl p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold tracking-wider">Quote Post</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="flex space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>
                {getInitials(userDisplayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] border-none resize-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 p-0"
                autoFocus
              />
            </div>
          </div>

          <QuotedPostCard
            post={post}
            onClick={() => {}}
          />

          <div className="flex items-center justify-between pt-3 border-t">
            <span className={`text-sm ${content.length > maxChars ? 'text-destructive' : 'text-muted-foreground'}`}>
              {content.length}/{maxChars}
            </span>
            <Button
              onClick={handleQuote}
              disabled={isDisabled}
              className="rounded-full px-6 bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              Quote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
