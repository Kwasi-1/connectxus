import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  getUserById,
  UserProfile as ApiUserProfile,
  checkFollowingStatus,
} from "@/api/users.api";
import {
  getPostsByUser,
  toggleLikePost,
  repostPost,
  Post as ApiPost,
} from "@/api/posts.api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

                const isOwnProfile = authUser?.id === userId;

                const promises: [
          Promise<ApiUserProfile>,
          Promise<ApiPost[]>,
          Promise<boolean> | Promise<false>
        ] = [
          getUserById(userId),
          getPostsByUser(userId, { page: 1, limit: 50 }),
                    !isOwnProfile && authUser
            ? checkFollowingStatus(userId)
            : Promise.resolve(false),
        ];

        const [userData, userPosts, followingStatus] = await Promise.all(
          promises
        );

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
          university: undefined,           major: userData.major || undefined,
          year: userData.year || undefined,
          createdAt: userData.created_at
            ? new Date(userData.created_at)
            : new Date(),
          roles: userData.roles || [],
          department: userData.department || undefined,
          level: userData.level || undefined,
          posts: transformPosts(userPosts, userData),
          joinedGroups: [],
          tutoringRequests: [],
        };

        setUser(transformedUser);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError(err.message || "Failed to load user profile");
        toast.error("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, authUser]);

    const transformPosts = (
    apiPosts: ApiPost[],
    userData: ApiUserProfile
  ): PostType[] => {
    return apiPosts.map((post) => ({
      id: post.id,
      author: {
        id: post.author_id,
        username: post.username || userData.username,
        displayName: post.full_name || userData.full_name,
        email: userData.email,
        avatar: post.author_avatar || userData.avatar,
        verified: post.author_verified || userData.verified || false,
        followers: userData.followers_count || 0,
        following: userData.following_count || 0,
        createdAt: userData.created_at
          ? new Date(userData.created_at)
          : new Date(),
        roles: userData.roles || [],
        department: userData.department,
        level: userData.level,
      },
      content: post.content,
      images: post.media?.images || undefined,
      video: post.media?.video || undefined,
      likes: post.likes_count,
      comments: post.comments_count,
      reposts: post.reposts_count,
      quotes: post.quotes_count || 0,
      isLiked: post.is_liked || false,
      isReposted: false,       createdAt: new Date(post.created_at),
      updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
      quotedPost: post.quoted_post
        ? {
            id: post.quoted_post.id,
            author: {
              id: post.quoted_post.author_id,
              username: post.quoted_username || "Unknown",
              displayName: post.quoted_full_name || "Unknown User",
              email: "",
              verified: post.quoted_post.author_verified || false,
              followers: 0,
              following: 0,
              createdAt: new Date(),
              roles: [],
            },
            content: post.quoted_content || "",
            likes: post.quoted_post.likes_count,
            comments: post.quoted_post.comments_count,
            reposts: post.quoted_post.reposts_count,
            quotes: post.quoted_post.quotes_count || 0,
            isLiked: false,
            isReposted: false,
            createdAt: new Date(post.quoted_post.created_at),
          }
        : undefined,
    }));
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
            const updatedPosts = user.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      );
      setUser({ ...user, posts: updatedPosts });

            await toggleLikePost(postId);
    } catch (err: any) {
      console.error("Error liking post:", err);
      toast.error("Failed to like post");

            const revertedPosts = user.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes + 1 : post.likes - 1,
            }
          : post
      );
      setUser({ ...user, posts: revertedPosts });
    }
  };

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = async (postId: string) => {
    if (!user) return;

    try {
            const updatedPosts = user.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isReposted: !post.isReposted,
              reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
            }
          : post
      );
      setUser({ ...user, posts: updatedPosts });

            await repostPost(postId);
      toast.success("Post reposted!");
    } catch (err: any) {
      console.error("Error reposting:", err);
      toast.error("Failed to repost");

            const revertedPosts = user.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isReposted: !post.isReposted,
              reposts: post.isReposted ? post.reposts + 1 : post.reposts - 1,
            }
          : post
      );
      setUser({ ...user, posts: revertedPosts });
    }
  };

  const handleQuote = (postId: string) => {
        navigate(`/compose?quote=${postId}`);
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleMediaClick = (post: any) => {
    console.log("Media clicked:", post);
  };

  const handleUserUpdate = (updatedUser: UserProfileType) => {
    setUser(updatedUser);
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
              {error || "User not found"}
            </div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

    const isOwnProfile = authUser?.id === userId;

  return (
    <AppLayout>
      <div className="border-x min-h-screen lg:border-x-0 pb-6 h-full">
        <div className="hidden px-2 py-4 sticky top-16 lg:top-0 bg-background z-50 md:flex items-center gap-2 border-b">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon icon="line-md:arrow-left" className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{user.username}</h1>
        </div>
        <ProfileHeader
          user={user}
          onUserUpdate={handleUserUpdate}
          isOwnProfile={isOwnProfile}
          initialIsFollowing={isFollowing}
        />
        <ProfileTabs
          user={user}
          isOwnProfile={isOwnProfile}
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

export default UserProfile;
