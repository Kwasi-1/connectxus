import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Post,
  toggleLikePost,
  repostPost as apiRepostPost,
  deletePost as deletePostApi,
} from "@/api/posts.api";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { PostActionsDropdown } from "./PostActionsDropdown";
import { ReportPostDialog } from "./ReportPostDialog";
import { LikesModal } from "./LikesModal";
import { RepostsModal } from "./RepostsModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import moment from "moment";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";


interface PostCardProps {
  
  post: Post;
  currentUserId?: string;

  
  detailed?: boolean;
  compact?: boolean;
  hideActions?: boolean;

  
  showRepostBanner?: boolean;

  
  className?: string;
}


export function PostCard({
  post: initialPost,
  currentUserId,
  detailed = false,
  compact = false,
  hideActions = false,
  showRepostBanner = true,
  className,
}: PostCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  
  const [post, setPost] = useState(initialPost);

  
  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showRepostsModal, setShowRepostsModal] = useState(false);

  
  const isRepost = post.quoted_post_id && (!post.content || post.content.trim() === '');

  
  
  const displayPost = isRepost && post.quoted_post ? post.quoted_post : post;
  const reposter = isRepost ? {
    id: post.author?.id || post.author_id,
    username: post.author?.username || post.username,
    full_name: post.author?.full_name || post.full_name,
  } : null;

  
  const likeMutation = useMutation({
    mutationFn: toggleLikePost,
    onMutate: async (postId) => {
      
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['user-posts'] });
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      await queryClient.cancelQueries({ queryKey: ['group-posts'] });
      await queryClient.cancelQueries({ queryKey: ['liked-posts'] });
      await queryClient.cancelQueries({ queryKey: ['trending-posts'] });

      
      setPost(prev => {
        
        const prevIsRepost = prev.quoted_post_id && (!prev.content || prev.content.trim() === '');
        
        const isLiked = prevIsRepost && prev.quoted_post
          ? (prev.quoted_post.is_liked || false)
          : (prev.is_liked || false);

        const newPost = prevIsRepost && prev.quoted_post ? {
          ...prev,
          quoted_post: {
            ...prev.quoted_post,
            is_liked: !isLiked,
            likes_count: isLiked
              ? (prev.quoted_post.likes_count || 0) - 1
              : (prev.quoted_post.likes_count || 0) + 1,
          }
        } : {
          ...prev,
          is_liked: !isLiked,
          likes_count: isLiked
            ? (prev.likes_count || 0) - 1
            : (prev.likes_count || 0) + 1,
        };
        return newPost;
      });

      
      const updatePostLike = (old: any) => {
        if (!old) return old;

        
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts?.map((p: any) =>
                p.id === postId
                  ? {
                      ...p,
                      is_liked: !p.is_liked,
                      likes_count: p.is_liked
                        ? Math.max(0, (p.likes_count || 0) - 1)
                        : (p.likes_count || 0) + 1,
                    }
                  : p
              ) || [],
            })),
          };
        }

        
        if (old.id === postId) {
          return {
            ...old,
            is_liked: !old.is_liked,
            likes_count: old.is_liked
              ? Math.max(0, (old.likes_count || 0) - 1)
              : (old.likes_count || 0) + 1,
          };
        }

        return old;
      };

      
      queryClient.setQueriesData({ queryKey: ['feed'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['user-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['community-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['group-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['liked-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['trending-posts'] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ['posts'] }, updatePostLike);
    },
    onError: (error: any) => {
      
      setPost(initialPost);
      toast.error(error.message || "Failed to like post");
    },
    onSuccess: () => {
      
      
    },
  });

  
  const repostMutation = useMutation({
    mutationFn: apiRepostPost,
    onMutate: async (postId) => {
      
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['user-posts'] });
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      await queryClient.cancelQueries({ queryKey: ['group-posts'] });
      await queryClient.cancelQueries({ queryKey: ['trending-posts'] });

      
      setPost(prev => {
        
        const prevIsRepost = prev.quoted_post_id && (!prev.content || prev.content.trim() === '');
        
        const isReposted = prevIsRepost && prev.quoted_post
          ? (prev.quoted_post.is_reposted || false)
          : (prev.is_reposted || false);

        const newPost = prevIsRepost && prev.quoted_post ? {
          ...prev,
          quoted_post: {
            ...prev.quoted_post,
            is_reposted: !isReposted,
            reposts_count: isReposted
              ? (prev.quoted_post.reposts_count || 0) - 1
              : (prev.quoted_post.reposts_count || 0) + 1,
          }
        } : {
          ...prev,
          is_reposted: !isReposted,
          reposts_count: isReposted
            ? (prev.reposts_count || 0) - 1
            : (prev.reposts_count || 0) + 1,
        };
        return newPost;
      });

      
      const updatePostRepost = (old: any) => {
        if (!old) return old;

        
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts?.map((p: any) =>
                p.id === postId
                  ? {
                      ...p,
                      is_reposted: !p.is_reposted,
                      reposts_count: p.is_reposted
                        ? Math.max(0, (p.reposts_count || 0) - 1)
                        : (p.reposts_count || 0) + 1,
                    }
                  : p
              ) || [],
            })),
          };
        }

        
        if (old.id === postId) {
          return {
            ...old,
            is_reposted: !old.is_reposted,
            reposts_count: old.is_reposted
              ? Math.max(0, (old.reposts_count || 0) - 1)
              : (old.reposts_count || 0) + 1,
          };
        }

        return old;
      };

      
      queryClient.setQueriesData({ queryKey: ['feed'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['user-posts'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['community-posts'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['group-posts'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['trending-posts'] }, updatePostRepost);
      queryClient.setQueriesData({ queryKey: ['posts'] }, updatePostRepost);
    },
    onSuccess: () => {
      toast.success("Post reposted");
    },
    onError: (error: any) => {
      
      setPost(initialPost);
      toast.error(error.message || "Failed to repost");
    },
    onSettled: () => {
      
    },
  });

  
  const deleteMutation = useMutation({
    mutationFn: deletePostApi,
    onMutate: async (postId) => {
      
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['user-posts'] });
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      await queryClient.cancelQueries({ queryKey: ['group-posts'] });
      await queryClient.cancelQueries({ queryKey: ['liked-posts'] });
      await queryClient.cancelQueries({ queryKey: ['trending-posts'] });

      
      const removePost = (old: any) => {
        if (!old) return old;

        
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts?.filter((p: any) => p.id !== postId) || [],
            })),
          };
        }

        return old;
      };

      
      queryClient.setQueriesData({ queryKey: ['feed'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['user-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['community-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['group-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['liked-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['trending-posts'] }, removePost);
      queryClient.setQueriesData({ queryKey: ['posts'] }, removePost);
    },
    onSuccess: () => {
      toast.success("Post deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete post");
    },
    onSettled: () => {
      
    },
  });

  
  const handlePostClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || detailed) {
      return;
    }
    
    navigate(`/post/${displayPost.id}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = displayPost.author?.id || displayPost.author_id;
    navigate(`/profile/${userId}`);
  };

  const handleReposterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reposter) {
      navigate(`/profile/${reposter.id}`);
    }
  };

  const handleInteractionClick = (
    e: React.MouseEvent,
    action: () => void
  ) => {
    e.stopPropagation();
    action();
  };

  const handleLike = () => {
    likeMutation.mutate(displayPost.id);
  };

  const handleComment = () => {
    navigate(`/post/${displayPost.id}`);
  };

  const handleRepost = () => {
    repostMutation.mutate(displayPost.id);
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${displayPost.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${displayPost.author?.full_name || displayPost.full_name}`,
          text: displayPost.content,
          url: postUrl,
        });
        toast.success("Post shared");
      } catch (error) {
        
      }
    } else {
      
      try {
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/post/${displayPost.id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleMuteUser = () => {
    
    toast.info("Mute user feature coming soon");
  };

  const handleReportPost = () => {
    setShowReportDialog(true);
  };

  const handleDeletePost = () => {
    deleteMutation.mutate(displayPost.id);
    setShowDeleteDialog(false);
  };

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    
    navigate(`/post/${displayPost.id}`);
  };

  const handleLikesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((displayPost.likes_count || 0) > 0) {
      setShowLikesModal(true);
    }
  };

  const renderMedia = () => {
    const media = displayPost.media || displayPost.images;
    if (!media || media.length === 0) return null;

    const hasVideo = media.some((url) =>
      url.endsWith(".mp4") || url.endsWith(".mov") || url.endsWith(".webm")
    );

    if (hasVideo) {
      return (
        <div className="mt-3 relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={media[0]}
            controls
            className="w-full h-full object-contain"
            onClick={handleMediaClick}
          >
            <source src={media[0]} type="video/mp4" />
          </video>
        </div>
      );
    }

    if (media.length === 1) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={media[0]}
            alt="Post media"
            className="w-full object-cover cursor-pointer"
            onClick={handleMediaClick}
          />
        </div>
      );
    }

    return (
      <div className={cn("mt-3 grid gap-2 rounded-lg overflow-hidden",
        media.length === 2 ? "grid-cols-2" : "grid-cols-2"
      )}>
        {media.slice(0, 4).map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Media ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleMediaClick}
            />
            {index === 3 && media.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  +{media.length - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const isOwnPost = currentUserId === post.author_id || currentUserId === post.author?.id;
  const isOwnOriginalPost = currentUserId === displayPost.author_id || currentUserId === displayPost.author?.id;

  const likesCount = displayPost.likes_count || 0;

  return (
    <Card
      className={cn(
        "rounded-none border-0 border-b transition-colors cursor-pointer",
        className
      )}
      onClick={handlePostClick}
    >
      <div className={cn("p-4", compact && "p-3")}>
        
        {showRepostBanner && reposter && (
          <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
            <Repeat2 className="h-4 w-4" />
            <span
              className="hover:underline cursor-pointer"
              onClick={handleReposterClick}
            >
              {reposter.full_name || reposter.username} reposted
            </span>
          </div>
        )}

        
        <div className="flex items-start gap-3">
          <Avatar
            className={cn("w-11 h-11 cursor-pointer", compact && "w-9 h-9")}
            onClick={handleUserClick}
          >
            <AvatarImage
              src={
                displayPost.author?.avatar ||
                displayPost.author_avatar ||
                "/api/placeholder/44/44"
              }
            />
            <AvatarFallback>
              {(displayPost.author?.full_name || displayPost.full_name || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            
            <div className="flex items-center gap-2">
              <span
                className="font-semibold hover:underline cursor-pointer truncate"
                onClick={handleUserClick}
              >
                {displayPost.author?.full_name || displayPost.full_name}
              </span>
              <span className="text-muted-foreground text-sm truncate">
                @{displayPost.author?.username || displayPost.username}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {moment(displayPost.created_at).fromNow()}
              </span>
            </div>

            
            <div className="mt-1">
              <p className="whitespace-pre-wrap break-words">
                {displayPost.content}
              </p>

              
              {renderMedia()}
            </div>

            
            {likesCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleLikesClick}
                  className="text-sm text-muted-foreground hover:underline cursor-pointer"
                >
                  {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
                </button>
              </div>
            )}

            
            {!hideActions && (
              <div className="flex items-center justify-between mt-3 max-w-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) =>
                    handleInteractionClick(e, handleComment)
                  }
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-full group"
                >
                  <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">{displayPost.comments_count || 0}</span>
                </Button>

                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) =>
                      handleInteractionClick(e, handleRepost)
                    }
                    disabled={isOwnOriginalPost}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-full group",
                      isOwnOriginalPost && "opacity-50 cursor-not-allowed",
                      displayPost.is_reposted
                        ? "text-green-500 bg-green-500/10"
                        : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                    )}
                  >
                    <Repeat2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span
                      className="text-sm hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if ((displayPost.reposts_count || 0) > 0) {
                          setShowRepostsModal(true);
                        }
                      }}
                    >
                      {displayPost.reposts_count || 0}
                    </span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) =>
                    handleInteractionClick(e, handleLike)
                  }
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-full group",
                    displayPost.is_liked
                      ? "text-red-500 bg-red-500/10"
                      : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  )}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 group-hover:scale-110 transition-transform",
                      displayPost.is_liked && "fill-current"
                    )}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleInteractionClick(e, handleShare)}
                  className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 p-2 rounded-full group"
                >
                  <Share className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>

                <PostActionsDropdown
                  post={displayPost}
                  isOwnPost={isOwnPost}
                  onCopyLink={handleCopyLink}
                  onMuteUser={handleMuteUser}
                  onReportPost={handleReportPost}
                  onDeletePost={isOwnPost ? () => setShowDeleteDialog(true) : undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      
      <ReportPostDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        postId={displayPost.id}
      />

      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={displayPost.id}
      />

      
      <RepostsModal
        isOpen={showRepostsModal}
        onClose={() => setShowRepostsModal(false)}
        postId={displayPost.id}
      />
    </Card>
  );
}