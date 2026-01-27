import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileHeader } from "@/components/account/ProfileHeader";
import { ProfileTabs } from "@/components/account/ProfileTabs";
import { ErrorBoundary } from "@/components/account/ErrorBoundary";
import { UserProfile } from "@/types/global";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/api/users.api";
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
      return getCurrentUser();
    },
    enabled: !!authUser?.id,
    staleTime: 60000,
    retry: 1,
    throwOnError: false,
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
        department_id_2: userProfile.department_id_2 || null,
        department_id_3: userProfile.department_id_3 || null,
        department_name: userProfile.department_name || "",
        department_name_2: userProfile.department_name_2 || null,
        department_name_3: userProfile.department_name_3 || null,
        followers: userProfile.followers_count || 0,
        following: userProfile.following_count || 0,
        verified: userProfile.verified || false,
        auth_provider: userProfile.auth_provider,
        email: userProfile.email,
        createdAt: userProfile.created_at
          ? new Date(userProfile.created_at)
          : new Date(),
        role: userProfile.roles?.[0] || "user",
        joinedGroups: [],
        tutoringRequests: [],
        posts: [],
      }
    : undefined;

  const handleUserUpdate = (updatedUser: UserProfile) => {
    queryClient.invalidateQueries({
      queryKey: ["user-profile", authUser?.id],
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
          <ProfileTabs user={transformedUser} isOwnProfile={true} />
        </ErrorBoundary>
      </div>
    </AppLayout>
  );
};

export default Account;
