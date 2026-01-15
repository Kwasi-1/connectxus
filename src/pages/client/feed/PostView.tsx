import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostCard } from "@/components/feed/PostCard";
import { ThreadedComment } from "@/components/feed/ThreadedComment";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment as CommentType } from "@/types/global";
import {
  getPostById,
  toggleLikePost,
  repostPost,
  getPostComments,
  createComment,
  Post as ApiPost,
  Comment as ApiComment,
  toggleLikeComment,
} from "@/api/posts.api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const [post, setPost] = useState<ApiPost | null>(null);
  const [flatComments, setFlatComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const transformComment = (apiComment: ApiComment): CommentType => {
    const authorData = apiComment.author || {};
    const authorId = authorData.id || apiComment.author_id;
    const username =
      authorData.username || (apiComment as any).username || "Unknown";
    const displayName =
      authorData.full_name || (apiComment as any).full_name || username;
    const avatar =
      authorData.avatar || (apiComment as any).author_avatar || undefined;
    const verified =
      authorData.verified || (apiComment as any).author_verified || false;

    return {
      id: apiComment.id,
      author: {
        id: authorId,
        username: username,
        displayName: displayName,
        email: authorData.email || "",
        avatar: avatar,
        verified: verified,
        followers: 0,
        following: 0,
        createdAt: new Date(),
        role: "user",
      },
      content: apiComment.content,
      postId: apiComment.post_id,
      parentCommentId: apiComment.parent_comment_id || null,
      depth: apiComment.depth || 0,
      likes: apiComment.likes_count,
      isLiked: apiComment.is_liked || false,
      repliesCount: apiComment.replies_count || 0,
      createdAt: new Date(apiComment.created_at),
    };
  };

  // Build threaded comment tree from flat list
  const threadedComments = useMemo(() => {
    if (flatComments.length === 0) return [];

    // Create a map by comment ID
    const commentMap = new Map<string, CommentType>();
    flatComments.forEach((c) => {
      commentMap.set(c.id, { ...c, replies: [] });
    });

    // Build tree
    const rootComments: CommentType[] = [];

    flatComments.forEach((c) => {
      const comment = commentMap.get(c.id)!;
      if (c.parentCommentId && commentMap.has(c.parentCommentId)) {
        const parent = commentMap.get(c.parentCommentId)!;
        if (!parent.replies) parent.replies = [];
        parent.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    // Count replies for each comment
    const countReplies = (comment: CommentType): number => {
      if (!comment.replies || comment.replies.length === 0) return 0;
      return comment.replies.reduce(
        (acc, reply) => acc + 1 + countReplies(reply),
        0
      );
    };

    rootComments.forEach((c) => {
      c.repliesCount = countReplies(c);
    });

    return rootComments;
  }, [flatComments]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      setLoading(true);

      try {
        const apiPost = await getPostById(postId);
        setPost(apiPost);
      } catch (err: any) {
        console.error("Error fetching post:", err);
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;

      setCommentsLoading(true);

      try {
        const apiComments = await getPostComments(postId, {
          page: 1,
          limit: 100,
        });
        setFlatComments(apiComments.map(transformComment));
      } catch (err: any) {
        console.error("Error fetching comments:", err);
        toast.error("Failed to load comments");
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleLike = async (postId: string) => {
    if (!post || post.id !== postId) return;

    const previousPost = { ...post };

    try {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });
      await queryClient.cancelQueries({ queryKey: ["group-posts"] });
      await queryClient.cancelQueries({ queryKey: ["liked-posts"] });
      await queryClient.cancelQueries({ queryKey: ["trending-posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      setPost({
        ...post,
        is_liked: !post.is_liked,
        likes_count: post.is_liked
          ? (post.likes_count || 0) - 1
          : (post.likes_count || 0) + 1,
      });

      const updatePostLike = (old: any) => {
        if (!old) return old;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts:
                page.posts?.map((p: any) =>
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

      queryClient.setQueriesData({ queryKey: ["feed"] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ["user-posts"] }, updatePostLike);
      queryClient.setQueriesData(
        { queryKey: ["community-posts"] },
        updatePostLike
      );
      queryClient.setQueriesData({ queryKey: ["group-posts"] }, updatePostLike);
      queryClient.setQueriesData({ queryKey: ["liked-posts"] }, updatePostLike);
      queryClient.setQueriesData(
        { queryKey: ["trending-posts"] },
        updatePostLike
      );
      queryClient.setQueriesData({ queryKey: ["posts"] }, updatePostLike);

      await toggleLikePost(postId);
    } catch (err: any) {
      console.error("Error liking post:", err);
      toast.error("Failed to like post");
      setPost(previousPost);
    }
  };

  const handleComment = (postId: string) => {
    document.querySelector("textarea")?.focus();
  };

  const handleRepost = async (postId: string) => {
    if (!post || post.id !== postId) return;

    const previousPost = { ...post };

    try {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });
      await queryClient.cancelQueries({ queryKey: ["group-posts"] });
      await queryClient.cancelQueries({ queryKey: ["trending-posts"] });

      setPost({
        ...post,
        is_reposted: !post.is_reposted,
        reposts_count: post.is_reposted
          ? (post.reposts_count || 0) - 1
          : (post.reposts_count || 0) + 1,
      });

      const updatePostRepost = (old: any) => {
        if (!old) return old;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts:
                page.posts?.map((p: any) =>
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

      queryClient.setQueriesData({ queryKey: ["feed"] }, updatePostRepost);
      queryClient.setQueriesData(
        { queryKey: ["user-posts"] },
        updatePostRepost
      );
      queryClient.setQueriesData(
        { queryKey: ["community-posts"] },
        updatePostRepost
      );
      queryClient.setQueriesData(
        { queryKey: ["group-posts"] },
        updatePostRepost
      );
      queryClient.setQueriesData(
        { queryKey: ["trending-posts"] },
        updatePostRepost
      );
      queryClient.setQueriesData({ queryKey: ["posts"] }, updatePostRepost);

      await repostPost(postId);
      toast.success("Post reposted!");
    } catch (err: any) {
      console.error("Error reposting:", err);
      toast.error("Failed to repost");
      setPost(previousPost);
    }
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleCommentLike = async (commentId: string) => {
    const updateLikeRecursively = (comments: CommentType[]): CommentType[] => {
      return comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateLikeRecursively(comment.replies),
          };
        }
        return comment;
      });
    };

    const previousComments = [...flatComments];

    try {
      setFlatComments(
        flatComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              }
            : comment
        )
      );

      await toggleLikeComment(commentId);
    } catch (err: any) {
      console.error("Error liking comment:", err);
      toast.error("Failed to like comment");
      setFlatComments(previousComments);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post || !postId) return;

    setIsSubmittingComment(true);

    try {
      await createComment(postId, { content: newComment });

      // Refresh comments
      const apiComments = await getPostComments(postId, {
        page: 1,
        limit: 100,
      });
      setFlatComments(apiComments.map(transformComment));

      setNewComment("");

      setPost({
        ...post,
        comments_count: (post.comments_count || 0) + 1,
      });

      const updateCommentCount = (old: any) => {
        if (!old) return old;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts:
                page.posts?.map((p: any) =>
                  p.id === postId
                    ? { ...p, comments_count: (p.comments_count || 0) + 1 }
                    : p
                ) || [],
            })),
          };
        }

        if (old.id === postId) {
          return { ...old, comments_count: (old.comments_count || 0) + 1 };
        }

        return old;
      };

      queryClient.setQueriesData({ queryKey: ["feed"] }, updateCommentCount);
      queryClient.setQueriesData(
        { queryKey: ["user-posts"] },
        updateCommentCount
      );
      queryClient.setQueriesData(
        { queryKey: ["community-posts"] },
        updateCommentCount
      );
      queryClient.setQueriesData(
        { queryKey: ["group-posts"] },
        updateCommentCount
      );
      queryClient.setQueriesData({ queryKey: ["posts"] }, updateCommentCount);

      toast.success("Comment added!");
    } catch (err: any) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyToComment = async (commentId: string, content: string) => {
    if (!content.trim() || !postId) return;

    try {
      await createComment(postId, {
        content: content,
        parent_comment_id: commentId,
      });

      // Refresh comments
      const apiComments = await getPostComments(postId, {
        page: 1,
        limit: 100,
      });
      setFlatComments(apiComments.map(transformComment));

      if (post) {
        setPost({
          ...post,
          comments_count: (post.comments_count || 0) + 1,
        });
      }

      const updateCommentCount = (old: any) => {
        if (!old) return old;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts:
                page.posts?.map((p: any) =>
                  p.id === postId
                    ? { ...p, comments_count: (p.comments_count || 0) + 1 }
                    : p
                ) || [],
            })),
          };
        }

        if (old.id === postId) {
          return { ...old, comments_count: (old.comments_count || 0) + 1 };
        }

        return old;
      };

      queryClient.setQueriesData({ queryKey: ["feed"] }, updateCommentCount);
      queryClient.setQueriesData(
        { queryKey: ["user-posts"] },
        updateCommentCount
      );
      queryClient.setQueriesData(
        { queryKey: ["community-posts"] },
        updateCommentCount
      );
      queryClient.setQueriesData(
        { queryKey: ["group-posts"] },
        updateCommentCount
      );
      queryClient.setQueriesData({ queryKey: ["posts"] }, updateCommentCount);

      toast.success("Reply added!");
    } catch (err: any) {
      console.error("Error adding reply:", err);
      toast.error("Failed to add reply");
      throw err;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen border-r border-border">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
          <p className="text-muted-foreground mt-2">
            The post you're looking for doesn't exist.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <AppLayout>
        <div className="min-h-screen border-r border-border">
          <div className="hidden lg:block sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-none border-border">
            <div className="flex items-center px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-8 p-2 hover:bg-muted rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground">Post</h1>
              </div>
            </div>
          </div>

          <div className="borderb border-border">
            <PostCard
              post={post}
              currentUserId={authUser?.id}
              detailed={true}
            />
          </div>

          {/* Comment Input - YouTube Style */}
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={authUser?.avatar} />
                <AvatarFallback>
                  {authUser?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full px-0 py-2 text-base bg-transparent text-foreground placeholder-muted-foreground border-muted-foreground/30 focus:border-foreground outline-none transition-colors"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmittingComment}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                {newComment.trim() && (
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewComment("")}
                      disabled={isSubmittingComment}
                      className="h-9 px-4 rounded-full font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="h-9 px-4 rounded-full font-medium bg-foreground text-background hover:bg-foreground/80"
                    >
                      {isSubmittingComment ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section - YouTube Threaded Style */}
          <div className="px-4">
            {/* Comments Count Header */}
            {!commentsLoading && threadedComments.length > 0 && (
              <div className="py-4 border-b border-border/50">
                <span className="text-sm font-medium text-foreground">
                  {flatComments.length}{" "}
                  {flatComments.length === 1 ? "Reply" : "Replys"}
                </span>
              </div>
            )}

            {commentsLoading ? (
              <LoadingSpinner size="md" />
            ) : threadedComments.length > 0 ? (
              <div className="divide-y-0">
                {threadedComments.map((comment) => (
                  <ThreadedComment
                    key={comment.id}
                    comment={comment}
                    onLike={handleCommentLike}
                    onReply={handleReplyToComment}
                    depth={0}
                    maxDepth={5}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No comments yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default PostView;
