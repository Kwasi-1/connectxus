
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { QuotedPostCard } from './QuotedPostCard';
import { Post } from '@/types/global';
import { mockUsers } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface QuotePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onQuote: (content: string, quotedPost: Post) => void;
}

export function QuotePostModal({ isOpen, onClose, post, onQuote }: QuotePostModalProps) {
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const maxChars = 280;

  const handleQuote = () => {
    if (content.trim()) {
      const newPost: Post = {
        id: Date.now().toString(),
        author: mockUsers[0],
        content,
        quotedPost: post,
        likes: 0,
        comments: 0,
        reposts: 0,
        quotes: 0,
        isLiked: false,
        isReposted: false,
        createdAt: new Date(),
      };

      // Store the quote data for the main feed to pick up
      sessionStorage.setItem('newQuote', JSON.stringify({
        newPost,
        quotedPostId: post.id
      }));

      onQuote(content, post);
      setContent('');
      onClose();
    }
  };

  const isDisabled = content.length > maxChars;

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
              <AvatarImage src={mockUsers[0].avatar} />
              <AvatarFallback>
                {mockUsers[0].displayName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] border-none resize-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 p-0"
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
