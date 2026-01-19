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
import { FeedbackModal } from "./FeedbackModal";
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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
      setIsUploadingCover(true);
      let avatarUrl = user.avatar;
      let coverImageUrl = user.cover_image || "";

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

      if (selectedCoverFile) {
        const uploadedFile = await uploadFile({
          file: selectedCoverFile,
          moduleType: "users",
          moduleId: user.id,
          accessLevel: "public",
        });
        coverImageUrl = uploadedFile.url;
        sonnerToast.success("Cover image uploaded successfully");
      }

      onUserUpdate({
        ...user,
        displayName: editForm.displayName,
        bio: editForm.bio,
        level: editForm.level,
        department_id: editForm.departmentId,
        avatar: avatarUrl,
        cover_image: coverImageUrl,
      });

      setIsEditing(false);
      setAvatarPreview(null);
      setSelectedAvatarFile(null);
      setCoverPreview(null);
      setSelectedCoverFile(null);
    } catch (error) {
      console.error("Error saving profile:", error);
      sonnerToast.error("Failed to save profile");
    } finally {
      setIsUploadingAvatar(false);
      setIsUploadingCover(false);
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
    setCoverPreview(null);
    setSelectedCoverFile(null);
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
      {/* Cover Image */}
      <div className="h-48 md:h-52 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 relative overflow-hidden">
        {/* Cover Image */}
        {(coverPreview || user.cover_image) && (
          <img
            src={coverPreview || user.cover_image}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}

        {/* Edit cover button - only visible when editing */}
        {isEditing && isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm text-foreground rounded-full p-2 shadow-lg hover:bg-background transition-colors z-10"
              disabled={isUploadingCover}
            >
              {isUploadingCover ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </button>
          </>
        )}

        {/* Gradient overlay at bottom of cover for smooth transition */}
        <div className="absolute -bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Avatar positioned outside cover container to avoid clipping */}
      <div className="absolute top-36 md:top-36 left-4 md:left-6 z-10">
        <div className="relative">
          <Avatar className="h-[85px] w-[85px] md:h-24 md:w-24 lg:h-28 lg:w-28 border-4 border-background  rounded-3xl md:rounded-[28px] shadow-md">
            <AvatarImage
              src={avatarPreview || user.avatar}
              alt={user.username}
            />
            <AvatarFallback className="text-3xl rounded-3xl">
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

      <div className="pt-14 md:pt-16 px-4 md:px-6 pb-4">
        <div className="flex items-start justify-between mb-1">
          {/* Name and username */}
          <div className="flex-1 min-w-0">
            {isEditing && isOwnProfile ? (
              <Input
                value={editForm.displayName}
                onChange={(e) =>
                  setEditForm({ ...editForm, displayName: e.target.value })
                }
                placeholder="Display Name"
                className="text-xl font-bold mb-1"
              />
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  {user.displayName || user.username}
                </h1>
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-3">
            {isOwnProfile ? (
              <>
                <Button
                  onClick={() => setShowFeedbackModal(true)}
                  variant="outline"
                  size="sm"
                  className="rounded-full font-medium border-muted-foreground/30"
                >
                  Submit Feedback
                </Button>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="rounded-full font-medium border-muted-foreground/30"
                >
                  {isEditing ? "Cancel" : "Edit profile"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleMessage}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-9 w-9 border-muted-foreground/30"
                  disabled={isMessageLoading}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className="rounded-full font-medium"
                  disabled={isFollowLoading}
                >
                  {isFollowLoading
                    ? "Loading..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing && isOwnProfile ? (
          <div className="space-y-4 max-w-lg mt-3">
            <Textarea
              value={editForm.bio}
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
              placeholder="Tell us about yourself..."
              rows={3}
              className="text-sm"
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

            <div className="flex gap-2 flex-wrap pt-2">
              <Button
                onClick={handleSave}
                size="sm"
                disabled={isUploadingAvatar}
                className="rounded-full font-medium"
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
                className="rounded-full font-medium border-muted-foreground/30"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="secondary"
                size="sm"
                type="button"
                className="rounded-full font-medium"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {/* Stats row */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFollowingModal(true)}
                className="hover:underline cursor-pointer transition-all text-sm"
              >
                <span className="font-bold text-foreground">
                  {user.following}
                </span>{" "}
                <span className="text-muted-foreground">Following</span>
              </button>
              <button
                onClick={() => setShowFollowersModal(true)}
                className="hover:underline cursor-pointer transition-all text-sm"
              >
                <span className="font-bold text-foreground">
                  {user.followers}
                </span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </button>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-foreground leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Additional info with icons */}
            {(user.space_name || user.department_name || user.level) && (
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {user.space_name && (
                  <span className="flex items-center gap-1">
                    🏫 {user.space_name}
                  </span>
                )}
                {user.department_name && (
                  <span className="flex items-center gap-1">
                    🎓 {user.department_name}
                  </span>
                )}
                {user.level && (
                  <span className="flex items-center gap-1">
                    📚 Level {user.level}
                  </span>
                )}
              </div>
            )}
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
};
