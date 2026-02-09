import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileHeader } from "@/components/account/ProfileHeader";
import { ProfileTabs } from "@/components/account/ProfileTabs";
import {
  UserProfile as UserProfileType,
  Post as PostType,
  User,
} from "@/types/global";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getUserByUsername,
  UserProfile as ApiUserProfile,
  checkFollowingStatusByUsername,
} from "@/api/users.api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<UserProfileType, Error>({
    queryKey: ["user-profile", username],
    queryFn: async () => {
      if (!username) {
        throw new Error("Username is required");
      }

      const isOwnProfile = authUser?.username === username;

      const promises: [
        Promise<ApiUserProfile>,
        Promise<boolean> | Promise<false>
      ] = [
        getUserByUsername(username),
        !isOwnProfile && authUser
          ? checkFollowingStatusByUsername(username)
          : Promise.resolve(false),
      ];

      const [userData, followingStatus] = await Promise.all(promises);

      setIsFollowing(followingStatus);

      const transformedUser: UserProfileType = {
        id: userData.id,
        username: userData.username,
        displayName: userData.full_name,
        email: userData.email,
        avatar: userData.avatar || undefined,
        bio: userData.bio || undefined,
        verified: userData.verified || false,
        followers: userData.followers_count || 0,
        following: userData.following_count || 0,
        university: undefined,
        major: userData.major || undefined,
        year: userData.year || undefined,
        createdAt: userData.created_at ? new Date(userData.created_at) : new Date(),
        roles: userData.roles || [],
        department: userData.department || undefined,
        level: userData.level || undefined,
        auth_provider: userData.auth_provider,
        posts: [],
        joinedGroups: [],
        tutoringRequests: [],
      };

      return transformedUser;
    },
    enabled: !!username,
    staleTime: 60000,
    gcTime: 300000, 
    retry: 1,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load user profile");
    }
  }, [error]);

  const handleUserUpdate = (updatedUser: UserProfileType) => {
    refetch();
  };

  const handleRefreshUserData = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-muted-foreground">
              {error?.message || "User not found"}
            </div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOwnProfile = authUser?.id === user.id;

  return (
    <AppLayout>
      <div className="border-x min-h-screen lg:border-l-0 pb-6 h-full">
        <div className="hidden px-2 py-4 sticky top-16 lg:top-0 bg-background z-40 md:flex items-center gap-2 border-b">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon icon="line-md:arrow-left" className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{user.username}</h1>
        </div>
        <ProfileHeader
          user={user}
          onUserUpdate={handleUserUpdate}
          onRefreshUserData={handleRefreshUserData}
          isOwnProfile={isOwnProfile}
          initialIsFollowing={isFollowing}
        />
        <ProfileTabs
          user={user}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </AppLayout>
  );
};

export default UserProfile;
