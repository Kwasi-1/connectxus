import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileHeader } from "@/components/account/ProfileHeader";
import { ProfileTabs } from "@/components/account/ProfileTabs";
import { UserProfile } from "@/types/global";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserById, updateUser, UpdateUserRequest } from "@/api/users.api";
import { getPostsByUser, toggleLikePost, repostPost } from "@/api/posts.api";
import { toast } from "sonner";

const Account = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

    const { data: userProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["user-profile", authUser?.id],
    queryFn: () =>
      authUser ? getUserById(authUser.id) : Promise.reject("No user"),
    enabled: !!authUser,
    staleTime: 60000,
  });

    const { data: userPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["user-posts", authUser?.id],
    queryFn: () =>
      authUser
        ? getPostsByUser(authUser.id, { page: 1, limit: 50 })
        : Promise.resolve([]),
    enabled: !!authUser,
    staleTime: 30000,
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
        displayName: userProfile.full_name,
        username: userProfile.username,
        avatar: userProfile.avatar || "",
        bio: userProfile.bio || "",
        level: userProfile.level || "",
        department: userProfile.department || "",
        major: userProfile.major || "",
        year: userProfile.year || 0,
        followers: userProfile.followers_count || 0,
        following: userProfile.following_count || 0,
        verified: userProfile.verified || false,
        posts: userPosts.map((post) => ({
          id: post.id,
          content: post.content,
          author: {
            id: userProfile.id,
            displayName: userProfile.full_name,
            username: userProfile.username,
            avatar: userProfile.avatar || "",
          },
          timestamp: post.created_at,
          likes: post.likes_count,
          comments: post.comments_count,
          reposts: post.reposts_count,
          isLiked: post.is_liked || false,
          isReposted: false,
        })),
      }
    : undefined;

  const handleUserUpdate = (updatedUser: UserProfile) => {
    updateUserMutation.mutate({
      full_name: updateduser.username,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      level: updatedUser.level,
      department: updatedUser.department,
      major: updatedUser.major,
      year: updatedUser.year,
    });
  };

  const handleLike = (postId: string) => {
    toggleLikePost(postId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["user-posts", authUser?.id] });
    });
  };

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: string) => {
    repostPost(postId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["user-posts", authUser?.id] });
      toast.success("Post reposted!");
    });
  };

  const handleQuote = (postId: string) => {
    console.log("Quote post:", postId);
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success("Link copied to clipboard");
  };

  const handleMediaClick = (post: any) => {
    console.log("Media clicked:", post);
  };

  if (loadingProfile || loadingPosts || !transformedUser) {
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
      <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full">
        <div className="hidden px-2 py-4 sticky top-16 lg:top-0 bg-background z-50 md:flex items-center gap-2 border-b">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon icon="line-md:arrow-left" className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{transformedUser.username}</h1>
        </div>
        <ProfileHeader user={transformedUser} onUserUpdate={handleUserUpdate} />
        <ProfileTabs
          user={transformedUser}
          isOwnProfile={true}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onQuote={handleQuote}
          onShare={handleShare}
          onMediaClick={handleMediaClick}
        />
      </div>
    </AppLayout>
  );
};

export default Account;
