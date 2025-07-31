
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Post, Comment } from '@/types/global';
import { mockPosts, mockUsers } from '@/data/mockData';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { mockTrendingTopics, mockCampusHighlights } from '@/data/mockData';
import { cn } from '@/lib/utils';

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Find the post by ID
    const foundPost = mockPosts.find(p => p.id === postId);
    if (foundPost) {
      setPost(foundPost);
      // Generate mock comments for the post
      generateMockComments(foundPost.id);
    }
  }, [postId]);

  const generateMockComments = (postId: string) => {
    const mockComments: Comment[] = [
      {
        id: '1',
        author: mockUsers[1],
        content: 'Great work on the project! The ML approach sounds really interesting.',
        postId,
        likes: 12,
        isLiked: false,
        createdAt: new Date('2024-01-31T11:00:00')
      },
      {
        id: '2',
        author: mockUsers[2],
        content: 'Would love to hear more about the data patterns you discovered!',
        postId,
        likes: 8,
        isLiked: true,
        createdAt: new Date('2024-01-31T11:15:00')
      }
    ];
    setComments(mockComments);
  };

  const handleLike = () => {
    if (!post) return;
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1
    });
  };

  const handleRepost = () => {
    if (!post) return;
    setPost({
      ...post,
      isReposted: !post.isReposted,
      reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1
    });
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !post) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: mockUsers[0], // Current user
      content: newComment,
      postId: post.id,
      likes: 0,
      isLiked: false,
      createdAt: new Date()
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activeTab="home" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 border-r border-border">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="rounded-full p-2 hover:bg-hover"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Post</h1>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4">
            <div className="flex space-x-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.author.avatar || "/api/placeholder/48/48"} />
                <AvatarFallback>
                  {post.author.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold text-foreground">{post.author.displayName}</span>
                  {post.author.verified && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                  <span className="text-muted-foreground">@{post.author.username}</span>
                </div>
                
                <div className="text-foreground text-xl leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.content}
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-border mb-4">
                    <img 
                      src={post.images[0]} 
                      alt="Post content" 
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}

                <div className="text-muted-foreground text-sm mb-4">
                  {post.createdAt.toLocaleTimeString()} · {post.createdAt.toLocaleDateString()}
                </div>

                {/* Interaction Stats */}
                <div className="flex items-center space-x-6 py-4 border-y border-border">
                  <span className="text-sm">
                    <span className="font-bold text-foreground">{post.reposts}</span>
                    <span className="text-muted-foreground ml-1">Reposts</span>
                  </span>
                  <span className="text-sm">
                    <span className="font-bold text-foreground">{post.likes}</span>
                    <span className="text-muted-foreground ml-1">Likes</span>
                  </span>
                </div>

                {/* Interaction Buttons */}
                <div className="flex items-center justify-around py-2 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-interaction-comment hover:bg-interaction-comment/10 p-2 rounded-full"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRepost}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-full",
                      post.isReposted 
                        ? "text-interaction-repost bg-interaction-repost/10" 
                        : "text-muted-foreground hover:text-interaction-repost hover:bg-interaction-repost/10"
                    )}
                  >
                    <Repeat2 className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-full",
                      post.isLiked 
                        ? "text-interaction-like bg-interaction-like/10" 
                        : "text-muted-foreground hover:text-interaction-like hover:bg-interaction-like/10"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", post.isLiked && "fill-current")} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-full"
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Comment Composer */}
            <div className="border-b border-border pb-4 mb-4">
              <div className="flex space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback>YU</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Post your reply"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] border-none resize-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 p-0 mb-3"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                      className="rounded-full px-6 bg-primary hover:bg-primary-hover disabled:opacity-50"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-4 hover:bg-hover/50 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.author.avatar || "/api/placeholder/40/40"} />
                    <AvatarFallback>
                      {comment.author.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-foreground">{comment.author.displayName}</span>
                      {comment.author.verified && (
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      )}
                      <span className="text-muted-foreground">@{comment.author.username}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    
                    <div className="text-foreground mb-2">{comment.content}</div>
                    
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1 text-muted-foreground hover:text-interaction-comment hover:bg-interaction-comment/10 p-1 rounded-full"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentLike(comment.id)}
                        className={cn(
                          "flex items-center space-x-1 p-1 rounded-full",
                          comment.isLiked 
                            ? "text-interaction-like bg-interaction-like/10" 
                            : "text-muted-foreground hover:text-interaction-like hover:bg-interaction-like/10"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", comment.isLiked && "fill-current")} />
                        <span className="text-xs">{comment.likes || 0}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Hidden on mobile and tablet */}
        <div className="hidden xl:block">
          <RightSidebar 
            trendingTopics={mockTrendingTopics}
            campusHighlights={mockCampusHighlights}
          />
        </div>
      </div>
    </div>
  );
};

export default PostView;
