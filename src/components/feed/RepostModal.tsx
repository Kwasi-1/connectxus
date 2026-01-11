import { Repeat2, Quote, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Post } from '@/types/global';

interface RepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onRepost: (postId: string) => void;
  onQuote: (postId: string) => void;
  onViewInteractions?: (postId: string) => void;
  isReposted?: boolean;
}

export function RepostModal({
  isOpen,
  onClose,
  post,
  onRepost,
  onQuote,
  onViewInteractions,
  isReposted = false,
}: RepostModalProps) {
  const handleRepost = () => {
    onRepost(post.id);
    onClose();
  };

  const handleQuote = () => {
    onQuote(post.id);
    onClose();
  };

  const handleViewInteractions = () => {
    onViewInteractions?.(post.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-center text-lg font-semibold">
            {isReposted ? 'Undo Repost?' : 'Repost'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-2 pb-4">
          {isReposted ? (
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-6 hover:bg-accent"
              onClick={handleRepost}
            >
              <Repeat2 className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Undo repost</div>
                <div className="text-sm text-muted-foreground">
                  Remove this post from your profile
                </div>
              </div>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-6 hover:bg-accent"
                onClick={handleRepost}
              >
                <Repeat2 className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Repost</div>
                  <div className="text-sm text-muted-foreground">
                    Instantly share to your followers
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-6 hover:bg-accent"
                onClick={handleQuote}
              >
                <Quote className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Quote</div>
                  <div className="text-sm text-muted-foreground">
                    Add a comment to this post
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-6 hover:bg-accent"
                onClick={handleViewInteractions}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Post Interactions</div>
                  <div className="text-sm text-muted-foreground">
                    See quotes and reposts
                  </div>
                </div>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
