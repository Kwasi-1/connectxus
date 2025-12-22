import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { getPostLikesPaginated } from '@/api/posts.api';
import { useNavigate } from 'react-router-dom';

interface UserLike {
  id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  department?: string | null;
  level?: string | null;
}

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function LikesModal({ isOpen, onClose, postId }: LikesModalProps) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<UserLike[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (isOpen) {
      setLikes([]);
      setPage(1);
      setHasMore(true);
      loadLikes(1);
    }
  }, [isOpen, postId]);

  const loadLikes = async (pageNum: number) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await getPostLikesPaginated(postId, {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      });

      if (pageNum === 1) {
        setLikes(data);
      } else {
        setLikes((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load likes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadLikes(nextPage);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] lg:max-w-xl p-0 max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold tracking-wider">Liked by</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {likes.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              No likes yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {likes.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-muted/5 transition-colors cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar || '/api/placeholder/48/48'} />
                      <AvatarFallback>
                        {user.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-foreground hover:underline">
                          {user.full_name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>

                      {(user.department || user.level) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {[user.department, user.level]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      )}

                      {user.bio && (
                        <p className="text-sm text-foreground mt-2 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && likes.length > 0 && (
            <div className="p-4 border-t border-border">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? 'Loading...' : 'Show more'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
