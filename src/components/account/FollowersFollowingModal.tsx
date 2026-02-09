import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MessageCircle, UserPlus, UserMinus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserFollowersByUsername,
  getUserFollowingByUsername,
  followUser,
  unfollowUser,
  checkFollowingStatus,
  UserProfile,
} from "@/api/users.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import { toast } from "sonner";

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  department?: string;
  level?: string;
  type: "followers" | "following";
}

export const FollowersFollowingModal = ({
  isOpen,
  onClose,
  userId,
  username,
  department,
  level,
  type,
}: FollowersFollowingModalProps) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState<
    Record<string, boolean>
  >({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let fetchedUsers: UserProfile[];

      if (type === "followers") {
        fetchedUsers = await getUserFollowersByUsername(username, {
          page: 1,
          limit: 100,
        });
      } else {
        fetchedUsers = await getUserFollowingByUsername(username, {
          page: 1,
          limit: 100,
        });
      }

      setUsers(fetchedUsers);

      if (authUser) {
        const statusPromises = fetchedUsers.map(async (user) => {
          if (user.id === authUser.id)
            return { userId: user.id, isFollowing: false };
          try {
            const isFollowing = await checkFollowingStatus(user.id);
            return { userId: user.id, isFollowing };
          } catch {
            return { userId: user.id, isFollowing: false };
          }
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap: Record<string, boolean> = {};
        statuses.forEach(({ userId, isFollowing }) => {
          statusMap[userId] = isFollowing;
        });
        setFollowingStates(statusMap);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast.error(`Failed to load ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (
    targetUserId: string,
    currentlyFollowing: boolean,
  ) => {
    if (!authUser || targetUserId === authUser.id) return;

    setLoadingStates((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      if (currentlyFollowing) {
        await unfollowUser(targetUserId);
        setFollowingStates((prev) => ({ ...prev, [targetUserId]: false }));
        toast.success("Unfollowed successfully");
      } else {
        await followUser(targetUserId);
        setFollowingStates((prev) => ({ ...prev, [targetUserId]: true }));
        toast.success("Following successfully");
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error(
        currentlyFollowing ? "Failed to unfollow" : "Failed to follow",
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleViewProfile = (targetUsername: string) => {
    navigate(`/profile/${targetUsername}`);
    onClose();
  };

  const handleMessage = async (targetUserId: string) => {
    if (!authUser || targetUserId === authUser.id) return;

    setLoadingStates((prev) => ({
      ...prev,
      [`message-${targetUserId}`]: true,
    }));

    try {
      const response = await getOrCreateDirectConversation(targetUserId);
      navigate(`/messages/${response.conversation_id}`);
      onClose();
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`message-${targetUserId}`]: false,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
          <DialogDescription className="text-sm space-y-1">
            <div>@{username}</div>
            {(department || level) && (
              <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                {department && <span>🏛️ {department}</span>}
                {level && <span>📊 {level}</span>}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {type} yet
            </div>
          ) : (
            users.map((user) => {
              const isOwnProfile = authUser?.id === user.id;
              const isFollowing = followingStates[user.id] || false;
              const isFollowLoading = loadingStates[user.id] || false;
              const isMessageLoading =
                loadingStates[`message-${user.id}`] || false;

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.avatar || undefined}
                      alt={user.username}
                    />
                    <AvatarFallback>
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {user.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      @{user.username}
                    </div>
                    {user.bio && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {user.bio}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProfile(user.username)}
                      className="h-8 w-8 p-0"
                      title="View Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {!isOwnProfile && isFollowing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMessage(user.id)}
                        disabled={isMessageLoading}
                        className="h-8 w-8 p-0"
                        title="Message"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {!isOwnProfile && (
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleFollow(user.id, isFollowing)}
                        disabled={isFollowLoading}
                        className="h-8 w-8 p-0"
                        title={isFollowing ? "Unfollow" : "Follow"}
                      >
                        {isFollowLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : isFollowing ? (
                          <UserMinus className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
