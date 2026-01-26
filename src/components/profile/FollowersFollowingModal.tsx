import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  getUserFollowersByUsername,
  getUserFollowingByUsername,
  followUser,
  unfollowUser,
  UserProfile,
} from "@/api/users.api";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  type: "followers" | "following";
}

export function FollowersFollowingModal({
  isOpen,
  onClose,
  userId,
  username,
  type,
}: FollowersFollowingModalProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>(
    {},
  );

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    if (isOpen) {
      setUsers([]);
      setPage(1);
      setHasMore(true);
      setFollowingState({});
      loadUsers(1);
    }
  }, [isOpen, userId, type]);

  const loadUsers = async (pageNum: number) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const fetchFunction =
        type === "followers"
          ? getUserFollowersByUsername
          : getUserFollowingByUsername;
      const data = await fetchFunction(username, {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      });

      if (pageNum === 1) {
        setUsers(data);
      } else {
        setUsers((prev) => [...prev, ...data]);
      }

      const newFollowingState: Record<string, boolean> = {};
      data.forEach((user) => {
        newFollowingState[user.id] = (user as any).is_following || false;
      });
      setFollowingState((prev) => ({ ...prev, ...newFollowingState }));

      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error(`Failed to load ${type}:`, error);
      toast.error(`Failed to load ${type}`);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadUsers(nextPage);
  };

  const handleFollow = async (targetUserId: string) => {
    const wasFollowing = followingState[targetUserId];

    setFollowingState((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      await followUser(targetUserId);
    } catch (error) {
      setFollowingState((prev) => ({ ...prev, [targetUserId]: wasFollowing }));
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    const wasFollowing = followingState[targetUserId];

    setFollowingState((prev) => ({ ...prev, [targetUserId]: false }));

    try {
      await unfollowUser(targetUserId);
    } catch (error) {
      setFollowingState((prev) => ({ ...prev, [targetUserId]: wasFollowing }));
      toast.error("Failed to unfollow user");
    }
  };

  const handleUserClick = (clickedUserId: string) => {
    navigate(`/profile/${clickedUserId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] lg:max-w-xl p-0 max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold tracking-wider">
            {type === "followers" ? "Followers" : "Following"}
          </h2>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No {type} yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-muted/5 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar
                      className="w-12 h-12 cursor-pointer"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <AvatarImage
                        src={user.avatar || "/api/placeholder/48/48"}
                      />
                      <AvatarFallback>
                        {user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-foreground hover:underline">
                              {user.full_name}
                            </span>
                            {user.verified && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground text-xs">
                                  ✓
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>

                          {(user.department || user.level) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {[user.department, user.level]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant={
                            followingState[user.id] ? "outline" : "default"
                          }
                          onClick={() =>
                            followingState[user.id]
                              ? handleUnfollow(user.id)
                              : handleFollow(user.id)
                          }
                          className="ml-2"
                        >
                          {followingState[user.id] ? "Following" : "Follow"}
                        </Button>
                      </div>

                      {user.bio && (
                        <p className="text-sm text-foreground mt-2 line-clamp-2">
                          {user.bio}
                        </p>
                      )}

                      {(user.followers_count !== undefined ||
                        user.following_count !== undefined) && (
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          {user.followers_count !== undefined && (
                            <span>
                              <span className="font-semibold text-foreground">
                                {user.followers_count}
                              </span>{" "}
                              followers
                            </span>
                          )}
                          {user.following_count !== undefined && (
                            <span>
                              <span className="font-semibold text-foreground">
                                {user.following_count}
                              </span>{" "}
                              following
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && users.length > 0 && (
            <div className="p-4 border-t border-border">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full"
                variant="outline"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Show more"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
