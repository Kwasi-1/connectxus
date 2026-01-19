import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileHeader } from "@/components/account/ProfileHeader";
import { ProfileTabs } from "@/components/account/ProfileTabs";
import { ErrorBoundary } from "@/components/account/ErrorBoundary";
import { UserProfile } from "@/types/global";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserById, updateUser, UpdateUserRequest } from "@/api/users.api";
import { toast } from "sonner";

const Account = () => {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

    const { data: userProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["user-profile", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) {
        throw new Error("No authenticated user");
      }
      return getUserById(authUser.id);
    },
    enabled: !!authUser?.id,
    staleTime: 60000,
    retry: 1,
    throwOnError: false,
  });


    const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) =>
      authUser ? updateUser(authUser.id, data) : Promise.reject("No user"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", authUser?.id],
      });
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

    const transformedUser: UserProfile | undefined = userProfile
    ? {
        id: userProfile.id,
        space_id: userProfile.space_id,
        space_name: userProfile.space_name || "",
        displayName: userProfile.full_name || userProfile.username || "",
        username: userProfile.username || "",
        avatar: userProfile.avatar || "",
        cover_image: userProfile.cover_image || "",
        bio: userProfile.bio || "",
        level: userProfile.level || "",
        department: userProfile.department || userProfile.department_name || "",
        department_id: userProfile.department_id || "",
        department_name: userProfile.department_name || "",
        followers: userProfile.followers_count || 0,
        following: userProfile.following_count || 0,
        verified: userProfile.verified || false,
        auth_provider: userProfile.auth_provider,
        posts: [],
      }
    : undefined;

  const handleUserUpdate = (updatedUser: UserProfile) => {
    updateUserMutation.mutate({
      full_name: updatedUser.displayName,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      cover_image: updatedUser.cover_image || undefined,
      level: updatedUser.level,
      department_id: updatedUser.department_id || undefined,
    });
  };

  const handleRefreshUserData = () => {
    queryClient.invalidateQueries({
      queryKey: ["user-profile", authUser?.id],
    });
  };

  if (loadingProfile || !transformedUser) {
    return (
      <AppLayout>
        <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="border-x min-h-screen lg:border-l-0 pb-6 h-full">
        <div className="hidden px-2 py-4 sticky top-16 lg:top-0 bg-background z-40 md:flex items-center gap-2 border-b">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon icon="line-md:arrow-left" className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{transformedUser.username}</h1>
        </div>
        <ProfileHeader
          user={transformedUser}
          onUserUpdate={handleUserUpdate}
          onRefreshUserData={handleRefreshUserData}
        />
        <ErrorBoundary>
          <ProfileTabs
            user={transformedUser}
            isOwnProfile={true}
          />
        </ErrorBoundary>
      </div>
    </AppLayout>
  );
};

export default Account;
