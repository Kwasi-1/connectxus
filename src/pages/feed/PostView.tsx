
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostCard } from '@/components/feed/PostCard';
import { Comment } from '@/components/feed/Comment';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { mockPosts, mockComments, mockUsers } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Post, Comment as CommentType } from '@/types/global';

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundPost = mockPosts.find(p => p.id === postId);
      setPost(foundPost || null);
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  // Fetch comments data
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      setCommentsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const postComments = mockComments.filter(c => c.postId === postId);
      setComments(postComments);
      setCommentsLoading(false);
    };

    fetchComments();
  }, [postId]);

  const handleLike = (postId: string) => {
    if (post && post.id === postId) {
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1
      });
    }
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleRepost = (postId: string) => {
    if (post && post.id === postId) {
      setPost({
        ...post,
        isReposted: !post.isReposted,
        reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1
      });
    }
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked, 
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 
          }
        : comment
    ));
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !post) return;

    const comment: CommentType = {
      id: Date.now().toString(),
      author: mockUsers[0], // Current user
      content: newComment,
      postId: post.id,
      likes: 0,
      isLiked: false,
      createdAt: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment('');
    
    // Update post comment count
    setPost({
      ...post,
      comments: post.comments + 1
    });
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
          <p className="text-muted-foreground mt-2">The post you're looking for doesn't exist.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen border-r border-border">
        {/* Header */}
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

        {/* Main Post */}
        <div className="border-b border-border">
          <PostCard
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onRepost={handleRepost}
            onShare={handleShare}
            detailed={true}
          />
        </div>
        
        {/* Reply Composer */}
        <div className="border-b border-border p-4">
          <div className="flex space-x-3">
            <Avatar className="w-11 h-11">
              <AvatarImage src={mockUsers[0].avatar} />
              <AvatarFallback>
                {mockUsers[0].displayName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                placeholder="Post your reply"
                className="w-full px-3 pb-3 pt-1 text-xl bg-transparent text-foreground placeholder-muted-foreground resize-none border-none outline-none"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-foreground text-primary-foreground px-5 py-1.5 rounded-full font-bold hover:bg-foreground/90 disabled:opacity-50"
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments */}
        <div>
          {commentsLoading ? (
            <LoadingSpinner size="md" />
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onLike={handleCommentLike}
                onReply={(commentId) => console.log('Reply to comment:', commentId)}
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
  );
};

export default PostView;
