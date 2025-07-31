import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostCard } from '@/components/feed/PostCard';
import { mockPosts, mockComments } from '@/data/mockData';

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  
  const post = mockPosts.find(p => p.id === postId);
  
  if (!post) {
    return (
      <AppLayout showRightSidebar={false}>
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

  return (
    <AppLayout showRightSidebar={false}>
      <div className="border-r border-border">
        {/* Main Post */}
        <PostCard
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onShare={handleShare}
          detailed={true}
        />
        
        {/* Comments Section */}
        <div className="border-t border-border">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Replies</h3>
            
            {/* Comment Composer */}
            <div className="flex space-x-3 mb-6">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <textarea
                  placeholder="Post your reply"
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button className="bg-foreground text-background px-6 py-2 rounded-full font-medium hover:bg-foreground/90">
                    Reply
                  </button>
                </div>
              </div>
            </div>
            
            {/* Comments */}
            <div className="space-y-4">
              {mockComments.filter(c => c.postId === postId).map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-4 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground">{comment.author.displayName}</span>
                      <span className="text-muted-foreground">@{comment.author.username}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground mt-1">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
                      <button className="hover:text-red-500 transition-colors">
                        ❤️ {comment.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PostView;
