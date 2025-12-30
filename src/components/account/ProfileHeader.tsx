import { useState, useEffect, useRef } from "react";
import { Edit, MessageCircle, Camera, Loader2, KeyRound } from "lucide-react";
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
import { uploadFile } from "@/api/files.api";
import { toast as sonnerToast } from "sonner";
import { FollowersFollowingModal } from "./FollowersFollowingModal";
import { UpdatePasswordModal } from "./UpdatePasswordModal";
import { useQuery } from "@tanstack/react-query";
import { getSpaces } from "@/api/spaces.api";
import { getDepartmentsBySpace } from "@/api/departments.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProfileHeaderProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
  onRefreshUserData?: () => void; 
  isOwnProfile?: boolean;
  initialIsFollowing?: boolean;
}

export const ProfileHeader = ({
  user,
  onUserUpdate,
  onRefreshUserData,
  isOwnProfile = true,
  initialIsFollowing = false,
}: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const [editForm, setEditForm] = useState({
    displayName: user.username,
    bio: user.bio || "",
    level: user.level || "",
    departmentId: user.department_id || "",
  });

  const { data: spacesData, isLoading: isLoadingSpaces } = useQuery({
    queryKey: ["spaces"],
    queryFn: getSpaces,
    enabled: isEditing && isOwnProfile, 
    staleTime: 5 * 60 * 1000,
  });

  const { data: departments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments", user.space_id],
    queryFn: () => getDepartmentsBySpace(user.space_id),
    enabled: isEditing && isOwnProfile && !!user.space_id,
    staleTime: 5 * 60 * 1000,
  });

  const spaces = (spacesData as any)?.spaces || [];

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      sonnerToast.error("Please select an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      sonnerToast.error("Image must be less than 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setSelectedAvatarFile(file);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      sonnerToast.error("Please select an image file");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      sonnerToast.error("Image must be less than 10MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    setSelectedCoverFile(file);
  };

  const handleSave = async () => {
    try {
      setIsUploadingAvatar(true);
      let avatarUrl = user.avatar;

      if (selectedAvatarFile) {
        const uploadedFile = await uploadFile({
          file: selectedAvatarFile,
          moduleType: "users",
          moduleId: user.id,
          accessLevel: "public",
        });
        avatarUrl = uploadedFile.url;
        sonnerToast.success("Avatar uploaded successfully");
      }

      onUserUpdate({
        ...user,
        displayName: editForm.displayName,
        bio: editForm.bio,
        level: editForm.level,
        department_id: editForm.departmentId,
        avatar: avatarUrl,
      });

      setIsEditing(false);
      setAvatarPreview(null);
      setSelectedAvatarFile(null);
    } catch (error) {
      console.error("Error saving profile:", error);
      sonnerToast.error("Failed to save profile");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      displayName: user.username,
      bio: user.bio || "",
      level: user.level || "",
      departmentId: user.department_id || "",
    });
    setIsEditing(false);
    setAvatarPreview(null);
    setSelectedAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
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
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage
                src={avatarPreview || user.avatar}
                alt={user.username}
              />
              <AvatarFallback className="text-3xl">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing && isOwnProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </button>
              </>
            )}
          </div>
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

            <div className="space-y-3">
              <div>
                <Label htmlFor="space" className="text-sm font-medium">
                  University (Space)
                </Label>
                {isLoadingSpaces ? (
                  <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading universities...</span>
                  </div>
                ) : (
                  <>
                    <Input
                      id="space"
                      value={
                        spaces?.find((s: any) => s.id === user.space_id)
                          ?.name || "Not set"
                      }
                      disabled
                      className="mt-1.5 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact support to change your university
                    </p>
                  </>
                )}
              </div>

              <div>
                <Label htmlFor="department" className="text-sm font-medium">
                  Department
                </Label>
                {isLoadingDepartments ? (
                  <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading departments...</span>
                  </div>
                ) : (
                  <Select
                    value={editForm.departmentId}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, departmentId: value })
                    }
                    disabled={!departments || departments.length === 0}
                  >
                    <SelectTrigger id="department" className="mt-1.5">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="level" className="text-sm font-medium">
                  Level
                </Label>
                <Select
                  value={editForm.level}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, level: value })
                  }
                >
                  <SelectTrigger id="level" className="mt-1.5">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                    <SelectItem value="600">600 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleSave}
                size="sm"
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={isUploadingAvatar}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="secondary"
                size="sm"
                type="button"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Change Password
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
              {user.space_name && <span>🏫 {user.space_name}</span>}
              {user.department_name && <span>🎓 {user.department_name}</span>}
              {user.level && <span>📚 Level {user.level}</span>}
            </div>
            <div className="flex gap-6 text-sm">
              <button
                onClick={() => setShowFollowingModal(true)}
                className="hover:underline cursor-pointer transition-all"
              >
                <strong>{user.following}</strong> Following
              </button>
              <button
                onClick={() => setShowFollowersModal(true)}
                className="hover:underline cursor-pointer transition-all"
              >
                <strong>{user.followers}</strong> Followers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Followers Modal */}
      <FollowersFollowingModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={user.id}
        username={user.username}
        department={user.department}
        level={user.level}
        type="followers"
      />

      {/* Following Modal */}
      <FollowersFollowingModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userId={user.id}
        username={user.username}
        department={user.department}
        level={user.level}
        type="following"
      />

      {/* Password Update Modal */}
      {isOwnProfile && (
        <UpdatePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          userId={user.id}
          authProvider={user.auth_provider}
          onPasswordUpdated={onRefreshUserData}
        />
      )}
    </div>
  );
};
