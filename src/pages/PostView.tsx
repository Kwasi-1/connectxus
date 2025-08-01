
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostCard } from '@/components/feed/PostCard';
import { mockPosts, mockComments } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const post = mockPosts.find(p => p.id === postId);
  
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

  const handleLike = (postId: string) => {
    console.log('Like post:', postId);
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleRepost = (postId: string) => {
    console.log('Repost:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const postComments = mockComments.filter(c => c.postId === postId);

  return (
    <AppLayout>
      <div className="min-h-screen border-r border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-none border-border">
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
          <div className="flex justify-between items-start">
            <Avatar className="w-11 h-11">
              <AvatarImage src="/api/placeholder/48/48" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                placeholder="Post your reply"
                className="w-full px-3 pb-3 pt-1 text-xl bg-transparent text-foreground placeholder-muted-foreground resize-none border-none outline-none"
                rows={1}
              />
            </div>
            <Button className="bg-foreground text-primary-foreground px-5 py-1.5 rounded-full font-bold hover:bg-foreground/90 disabled:opacity-50">
              Reply
            </Button>
          </div>
        </div>
        
        {/* Comments */}
        <div>
          {postComments.length > 0 ? (
            postComments.map((comment) => (
              <div key={comment.id} className="border-b border-border p-4 hover:bg-muted/5 transition-colors">
                <div className="flex space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.author.avatar || "/api/placeholder/48/48"} />
                    <AvatarFallback>
                      {comment.author.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-foreground">{comment.author.displayName}</span>
                      {comment.author.verified && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      )}
                      <span className="text-muted-foreground">@{comment.author.username}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center space-x-6 mt-3 text-muted-foreground">
                      <button className="flex items-center space-x-2 hover:text-primary transition-colors">
                        <span className="text-sm">💬</span>
                        <span className="text-sm">0</span>
                      </button>
                      <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                        <span className="text-sm">🔄</span>
                        <span className="text-sm">0</span>
                      </button>
                      <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                        <span className="text-sm">❤️</span>
                        <span className="text-sm">{comment.likes}</span>
                      </button>
                      <button className="hover:text-primary transition-colors">
                        <span className="text-sm">📤</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
