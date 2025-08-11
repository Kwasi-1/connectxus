
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Feed } from '@/components/feed/Feed';
import { FullScreenPostModal } from '@/components/feed/FullScreenPostModal';
import { mockPosts, mockUsers } from '@/data/mockData';
import { Post } from '@/types/global';

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPosts(mockPosts);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleCreatePost = (content: string, audience?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: mockUsers[0],
      content,
      likes: 0,
      comments: 0,
      reposts: 0,
      quotes: 0,
      isLiked: false,
      isReposted: false,
      createdAt: new Date(),
    };
    setPosts([newPost, ...posts]);
  };

  const handleQuote = (content: string, quotedPost: Post) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: mockUsers[0],
      content,
      quotedPost,
      likes: 0,
      comments: 0,
      reposts: 0,
      quotes: 0,
      isLiked: false,
      isReposted: false,
      createdAt: new Date(),
    };
    
    // Update the quoted post's quote count
    setPosts(prevPosts => [
      newPost,
      ...prevPosts.map(post => 
        post.id === quotedPost.id 
          ? { ...post, quotes: post.quotes + 1 }
          : post
      )
    ]);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleRepost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isReposted: !post.isReposted, 
            reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1 
          }
        : post
    ));
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleMediaClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  return (
    <>
      <AppLayout onCreatePost={handleCreatePost}>
        <Feed
          posts={posts}
          onCreatePost={handleCreatePost}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onQuote={handleQuote}
          onShare={handleShare}
          onMediaClick={handleMediaClick}
          loading={loading}
        />
      </AppLayout>

      {selectedPost && (
        <FullScreenPostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          post={selectedPost}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onShare={handleShare}
        />
      )}
    </>
  );
};

export default Index;
