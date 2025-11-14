import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostCard } from "@/components/feed/PostCard";
import { Comment } from "@/components/feed/Comment";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QuotePostModal } from "@/components/feed/QuotePostModal";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Post, Comment as CommentType } from "@/types/global";
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

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const transformPost = (apiPost: ApiPost): Post => {
    return {
      id: apiPost.id,
      author: {
        id: apiPost.author_id,
        username: apiPost.username || "Unknown",
        displayName: apiPost.full_name || "Unknown User",
        email: "",
        avatar: apiPost.author_avatar || undefined,
        verified: apiPost.author_verified || false,
        followers: 0,
        following: 0,
        createdAt: new Date(),
        roles: [],
      },
      content: apiPost.content,
      images: apiPost.media?.images || undefined,
      video: apiPost.media?.video || undefined,
      likes: apiPost.likes_count,
      comments: apiPost.comments_count,
      reposts: apiPost.reposts_count,
      quotes: apiPost.quotes_count || 0,
      isLiked: apiPost.is_liked || false,
      isReposted: false,
      createdAt: new Date(apiPost.created_at),
      updatedAt: apiPost.updated_at ? new Date(apiPost.updated_at) : undefined,
      quotedPost: apiPost.quoted_post
        ? transformPost(apiPost.quoted_post)
        : undefined,
    };
  };

  const transformComment = (apiComment: ApiComment): CommentType => {
    return {
      id: apiComment.id,
      author: {
        id: apiComment.author_id,
        username: apiComment.author?.username || "Unknown",
        displayName: apiComment.author?.full_name || "Unknown User",
        email: apiComment.author?.email || "",
        avatar: apiComment.author?.avatar || undefined,
        verified: apiComment.author?.verified || false,
        followers: 0,
        following: 0,
        createdAt: new Date(),
        roles: [],
      },
      content: apiComment.content,
      postId: apiComment.post_id,
      likes: apiComment.likes_count,
      isLiked: apiComment.is_liked || false,
      createdAt: new Date(apiComment.created_at),
    };
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      setLoading(true);

      try {
        const apiPost = await getPostById(postId);
        setPost(transformPost(apiPost));
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
        setComments(apiComments.map(transformComment));
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
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      });

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
      setPost({
        ...post,
        isReposted: !post.isReposted,
        reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
      });

      await repostPost(postId);
      toast.success("Post reposted!");
    } catch (err: any) {
      console.error("Error reposting:", err);
      toast.error("Failed to repost");

      setPost(previousPost);
    }
  };

  const handleQuote = (postId: string) => {
    if (post && post.id === postId) {
      setQuoteModalOpen(true);
    }
  };

  const handleQuoteSubmit = (content: string, quotedPost: Post) => {
    if (post) {
      setPost({
        ...post,
        quotes: post.quotes + 1,
      });
    }
    setQuoteModalOpen(false);
    toast.success("Post quoted!");
    navigate("/");
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleCommentLike = async (commentId: string) => {
    const previousComments = [...comments];

    try {
      setComments(
        comments.map((comment) =>
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

      setComments(previousComments);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post || !postId) return;

    setIsSubmittingComment(true);

    try {
      const apiComment = await createComment(postId, { content: newComment });
      const newCommentObj = transformComment(apiComment);

      setComments([...comments, newCommentObj]);
      setNewComment("");

      setPost({
        ...post,
        comments: post.comments + 1,
      });

      toast.success("Comment added!");
    } catch (err: any) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
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

          <div className="border-b border-border">
            <PostCard
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onRepost={handleRepost}
              onQuote={handleQuote}
              onShare={handleShare}
              detailed={true}
            />
          </div>

          <div className="border-b border-border p-4">
            <div className="flex space-x-3">
              <Avatar className="w-11 h-11">
                <AvatarImage src={authUser?.avatar} />
                <AvatarFallback>
                  {authUser?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  placeholder="Post your reply"
                  className="w-full px-3 pb-3 pt-1 text-xl bg-transparent text-foreground placeholder-muted-foreground resize-none border-none outline-none"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmittingComment}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="bg-foreground text-primary-foreground px-5 py-1.5 rounded-full font-bold hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {isSubmittingComment ? "Posting..." : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            {commentsLoading ? (
              <LoadingSpinner size="md" />
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onLike={handleCommentLike}
                  onReply={(commentId) =>
                    console.log("Reply to comment:", commentId)
                  }
                />
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No replies yet</p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>

      {post && (
        <QuotePostModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          post={post}
          onQuote={handleQuoteSubmit}
        />
      )}
    </>
  );
};

export default PostView;
