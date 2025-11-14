import { useState, useEffect } from "react";
import { Edit, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/types/global";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { followUser, unfollowUser } from "@/api/users.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import { toast as sonnerToast } from "sonner";

interface ProfileHeaderProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
  isOwnProfile?: boolean;
  initialIsFollowing?: boolean;
}

export const ProfileHeader = ({
  user,
  onUserUpdate,
  isOwnProfile = true,
  initialIsFollowing = false,
}: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);
  const [editForm, setEditForm] = useState({
    displayName: user.username,
    bio: user.bio || "",
    major: user.major || "",
    year: user.year || 1,
  });

  const handleSave = () => {
    onUserUpdate({
      ...user,
      displayName: editForm.displayName,
      bio: editForm.bio,
      major: editForm.major,
      year: editForm.year,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      displayName: user.username,
      bio: user.bio || "",
      major: user.major || "",
      year: user.year || 1,
    });
    setIsEditing(false);
  };

  const handleFollow = async () => {
    if (isFollowLoading) return;

    const previousFollowState = isFollowing;
    setIsFollowLoading(true);

    try {
      setIsFollowing(!isFollowing);

      if (isFollowing) {
        await unfollowUser(user.id);
        sonnerToast.success(`Unfollowed ${user.username}`);

        onUserUpdate({
          ...user,
          followers: Math.max(0, user.followers - 1),
        });
      } else {
        await followUser(user.id);
        sonnerToast.success(`Now following ${user.username}`);

        onUserUpdate({
          ...user,
          followers: user.followers + 1,
        });
      }
    } catch (err: any) {
      console.error("Error following/unfollowing user:", err);
      sonnerToast.error(
        isFollowing ? "Failed to unfollow user" : "Failed to follow user"
      );

      setIsFollowing(previousFollowState);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (isMessageLoading) return;

    setIsMessageLoading(true);

    try {
      const response = await getOrCreateDirectConversation(user.id);

      navigate(`/messages/${response.conversation_id}`);
    } catch (err: any) {
      console.error("Error creating conversation:", err);
      sonnerToast.error("Failed to start conversation");
    } finally {
      setIsMessageLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="h-36 bg-gradient-to-r from-blue-400 to-purple-600 relative">
        <div className="absolute -bottom-16 left-4">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="text-4xl">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="pt-8 px-6 pb-4">
        <div className="flex justify-end mb-4">
          {isOwnProfile ? (
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="rounded-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          ) : (
            <div className="flex gap-2">
              {isFollowing && (
                <Button
                  onClick={handleMessage}
                  variant="outline"
                  className="rounded-full"
                  disabled={isMessageLoading}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isMessageLoading ? "Loading..." : "Message"}
                </Button>
              )}
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className="rounded-full"
                disabled={isFollowLoading}
              >
                {isFollowLoading
                  ? "Loading..."
                  : isFollowing
                  ? "Following"
                  : "Follow"}
              </Button>
            </div>
          )}
        </div>

        {isEditing && isOwnProfile ? (
          <div className="space-y-4 max-w-lg">
            <Input
              value={editForm.displayName}
              onChange={(e) =>
                setEditForm({ ...editForm, displayName: e.target.value })
              }
              placeholder="Display Name"
            />
            <Textarea
              value={editForm.bio}
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
              placeholder="Bio"
              rows={3}
            />
            <div className="flex gap-3">
              <Input
                value={editForm.major}
                onChange={(e) =>
                  setEditForm({ ...editForm, major: e.target.value })
                }
                placeholder="Major"
                className="flex-1"
              />
              <Input
                type="number"
                value={editForm.year}
                onChange={(e) =>
                  setEditForm({ ...editForm, year: parseInt(e.target.value) })
                }
                placeholder="Year"
                className="w-20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              {user.verified && <Badge variant="default">Verified</Badge>}
            </div>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.bio && (
              <p className="text-base text-wrap text-foreground/90 whitespace-pre-line break-words">
                {user.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.major && <span>🎓 {user.major}</span>}
              {user.year && <span>📅 Year {user.year}</span>}
              {user.university && <span>🏫 {user.university}</span>}
            </div>
            <div className="flex gap-6 text-sm">
              <span>
                <strong>{user.following}</strong> Following
              </span>
              <span>
                <strong>{user.followers}</strong> Followers
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
