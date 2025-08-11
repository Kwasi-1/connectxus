
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { Post } from '@/types/global';
import { QuotedPostCard } from './QuotedPostCard';

interface QuotePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuote: (content: string, quotedPost: Post) => void;
  quotedPost: Post;
  currentUserAvatar?: string;
  currentUserName?: string;
}

export function QuotePostModal({ 
  isOpen, 
  onClose, 
  onQuote, 
  quotedPost,
  currentUserAvatar = "/api/placeholder/48/48",
  currentUserName = "You"
}: QuotePostModalProps) {
  const [content, setContent] = useState('');
  const maxChars = 280;

  const handleQuote = () => {
    if (content.trim() || true) { // Allow empty quotes like Twitter
      onQuote(content, quotedPost);
      setContent('');
      onClose();
    }
  };

  const isDisabled = content.length > maxChars;

  const handleQuotedPostClick = (post: Post) => {
    // Navigate to the quoted post - you can implement this navigation
    console.log('Navigate to quoted post:', post.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 pb-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-lg font-semibold">
              Quote Post
            </DialogTitle>
          </div>
          <Button
            onClick={handleQuote}
            disabled={isDisabled}
            className="rounded-full px-6 bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            Quote
          </Button>
        </DialogHeader>

        <div className="p-4 pt-2">
          <div className="flex space-x-3">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={currentUserAvatar} />
              <AvatarFallback>{currentUserName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              {/* Text Area */}
              <Textarea
                placeholder="Add a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] border-none resize-none text-xl placeholder:text-muted-foreground focus-visible:ring-0 p-0"
              />

              {/* Quoted Post */}
              <QuotedPostCard 
                post={quotedPost} 
                onQuotedPostClick={handleQuotedPostClick}
              />

              {/* Character Count */}
              <div className="flex justify-end pt-2">
                <span className={`text-sm ${content.length > maxChars ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {content.length}/{maxChars}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
