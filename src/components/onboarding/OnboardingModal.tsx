import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/api/files.api";
import {
  updateUser,
  getSuggestedUsers,
  followUser,
  UserProfile,
} from "@/api/users.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  Image as ImageIcon,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  UserPlus,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

type OnboardingStep = "avatar" | "cover" | "follow";

const STEPS: OnboardingStep[] = ["avatar", "cover", "follow"];

const STEP_INFO = {
  avatar: {
    title: "Add a profile photo",
    description: "Help others recognize you with a profile picture",
    icon: Camera,
  },
  cover: {
    title: "Add a cover image",
    description: "Personalize your profile with a banner image",
    icon: ImageIcon,
  },
  follow: {
    title: "Follow people to get started",
    description: "Follow at least one person to see their posts in your feed",
    icon: Users,
  },
};

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const currentStep = STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Fetch suggested users for the follow step
  const { data: suggestedUsers = [], isLoading: isLoadingSuggestions } =
    useQuery({
      queryKey: ["suggested-users-onboarding"],
      queryFn: () => getSuggestedUsers({ limit: 12 }),
      enabled: currentStep === "follow",
    });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: {
      avatar?: string | null;
      cover_image?: string | null;
    }) => updateUser(user?.id || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Follow user mutation
  const followUserMutation = useMutation({
    mutationFn: followUser,
    onSuccess: (_, userId) => {
      setFollowedUsers((prev) => new Set(prev).add(userId));
      queryClient.invalidateQueries({
        queryKey: ["suggested-users-onboarding"],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to follow user");
    },
  });

  const handleFileUpload = useCallback(
    async (file: File, type: "avatar" | "cover") => {
      const setUploading =
        type === "avatar" ? setIsUploadingAvatar : setIsUploadingCover;
      const setPreview = type === "avatar" ? setAvatarPreview : setCoverPreview;

      try {
        setUploading(true);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload file
        const result = await uploadFile({
          file,
          moduleType: "user",
          moduleId: user?.id || "",
          accessLevel: "public",
        });

        // Update user profile
        const updateData =
          type === "avatar"
            ? { avatar: result.url }
            : { cover_image: result.url };

        await updateUserMutation.mutateAsync(updateData);

        toast.success(
          type === "avatar" ? "Profile photo updated!" : "Cover image updated!",
        );
      } catch (error: any) {
        toast.error(error.message || `Failed to upload ${type}`);
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [user?.id, updateUserMutation],
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "avatar");
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "cover");
    }
  };

  const handleFollowUser = (userId: string) => {
    if (!followedUsers.has(userId)) {
      followUserMutation.mutate(userId);
    }
  };

  const canProceed = () => {
    if (currentStep === "follow") {
      return followedUsers.size >= 1;
    }
    return true; // Avatar and cover are optional
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete onboarding
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep !== "follow") {
      handleNext();
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "avatar":
        return (
          <div className="flex flex-col items-center space-y-6 py-8">
            <div
              className="relative cursor-pointer group"
              onClick={() => avatarInputRef.current?.click()}
            >
              <Avatar className="h-32 w-32 border-4 border-border rounded-[28px]">
                {avatarPreview || user?.avatar ? (
                  <AvatarImage src={avatarPreview || user?.avatar || ""} />
                ) : (
                  <AvatarFallback className="text-3xl bg-muted rounded-[28px]">
                    {getInitials(user?.name || "U")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-[28px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <label htmlFor="avatar-upload" className="sr-only">
              Upload profile photo
            </label>
            <input
              id="avatar-upload"
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isUploadingAvatar}
              aria-label="Upload profile photo"
            />
            <p className="text-sm text-muted-foreground">
              Click to upload a profile photo
            </p>
          </div>
        );

      case "cover":
        return (
          <div className="flex flex-col items-center space-y-6 py-8">
            <div
              className={cn(
                "relative w-full h-40 rounded-lg border-2 border-dashed border-border cursor-pointer group overflow-hidden",
                "hover:border-primary transition-colors",
              )}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  {isUploadingCover ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <span className="text-sm">
                        Click to upload a cover image
                      </span>
                    </>
                  )}
                </div>
              )}
              {coverPreview && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingCover ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </div>
              )}
            </div>
            <label htmlFor="cover-upload" className="sr-only">
              Upload cover image
            </label>
            <input
              id="cover-upload"
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
              disabled={isUploadingCover}
              aria-label="Upload cover image"
            />
          </div>
        );

      case "follow":
        return (
          <div className="py-4 max-h-[400px] overflow-y-auto scrollbar-hide w-full max-w-[450px] mx-auto">
            {isLoadingSuggestions ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-9 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : suggestedUsers.length > 0 ? (
              <div className="space-y-2 ">
                {suggestedUsers.map((suggestedUser: UserProfile) => (
                  <div
                    key={suggestedUser.id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={suggestedUser.avatar || ""} />
                        <AvatarFallback>
                          {getInitials(
                            suggestedUser.full_name || suggestedUser.username,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {suggestedUser.full_name || suggestedUser.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{suggestedUser.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        followedUsers.has(suggestedUser.id)
                          ? "outline"
                          : "default"
                      }
                      className={
                        followedUsers.has(suggestedUser.id)
                          ? "border-border text-foreground hover:bg-muted rounded-full px-4"
                          : "bg-foreground text-background hover:bg-foreground/90 rounded-full px-4"
                      }
                      // size="sm"
                      onClick={() => handleFollowUser(suggestedUser.id)}
                      disabled={
                        followUserMutation.isPending &&
                        followUserMutation.variables === suggestedUser.id
                      }
                    >
                      {followUserMutation.isPending &&
                      followUserMutation.variables === suggestedUser.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : followedUsers.has(suggestedUser.id) ? (
                        <>
                          {/* <UserCheck className="h-4 w-4 mr-1" /> */}
                          Following
                        </>
                      ) : (
                        <>
                          {/* <UserPlus className="h-4 w-4 mr-1" /> */}
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No suggestions available at the moment</p>
              </div>
            )}

            {followedUsers.size < 1 && (
              <p className="text-center text-sm text-amber-500 mt-4">
                Follow at least 1 person to continue
              </p>
            )}
          </div>
        );
    }
  };

  const StepIcon = STEP_INFO[currentStep].icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md md:max-w-xl md:rounded-3xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress bar */}
        {/* <Progress
          value={progress}
          className="absolute top-0 left-0 right-0 h-1 rounded-t-lg rounded-b-none"
        /> */}

        {/* Step indicators */}
        <div className="flex justify-center space-x-2 pt-4">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                index === currentStepIndex
                  ? "bg-primary"
                  : index < currentStepIndex
                    ? "bg-primary/60"
                    : "bg-muted",
              )}
            />
          ))}
        </div>

        <DialogHeader className="text-center">
          {/* <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
            <StepIcon className="h-6 w-6 text-primary" />
          </div> */}
          <DialogTitle className="text-xl text-center mt-10">
            {STEP_INFO[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {STEP_INFO[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 bordert border-border">
          <div>
            {currentStepIndex > 0 && (
              <Button
                variant="ghost"
                onClick={handlePrevious}
                className="text-muted-foreground rounded-full"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {currentStep !== "follow" && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground rounded-full"
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isUploadingAvatar || isUploadingCover}
              className="rounded-full"
            >
              {currentStepIndex === STEPS.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
