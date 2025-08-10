
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

  // Simulate API call with useEffect
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      // Simulate API delay
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
      isLiked: false,
      isReposted: false,
      createdAt: new Date(),
    };
    setPosts([newPost, ...posts]);
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
