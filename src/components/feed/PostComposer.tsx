import { useState } from 'react';
import { ImageIcon, Calendar, MapPin, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

interface PostComposerProps {
  onPost: (content: string) => void;
}

export function PostComposer({ onPost }: PostComposerProps) {
  const [content, setContent] = useState('');
  const maxChars = 280;

  const handlePost = () => {
    if (content.trim()) {
      onPost(content);
      setContent('');
    }
  };

  const isDisabled = !content.trim() || content.length > maxChars;

  return (
    <Card className="hidden md:block border-0 rounded-none border-b border-border p-4">
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/api/placeholder/48/48" />
          <AvatarFallback>YU</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What's happening on campus?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[40px] border-none resize-none text-xl placeholder:text-muted-foreground focus-visible:ring-0 p-0"
          />
          
          {/* Character Count */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 text-primary">
              <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-primary/10">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-primary/10">
                <Calendar className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-primary/10">
                <MapPin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-primary/10">
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${content.length > maxChars ? 'text-destructive' : 'text-muted-foreground'}`}>
                {content.length}/{maxChars}
              </span>
              <Button
                onClick={handlePost}
                disabled={isDisabled}
                className="rounded-full px-6 bg-primary hover:bg-primary-hover disabled:opacity-50"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}