
import React from 'react';
import { MobilePostPage } from '@/components/post/MobilePostPage';
import { useNavigate } from 'react-router-dom';
import { Post } from '@/types/global';
import { mockUsers } from '@/data/mockData';

const Compose = () => {
  const navigate = useNavigate();

  const handleCreatePost = (content: string, audience: string) => {
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

    // In a real app, you would save this post to your backend
    console.log('New post created:', newPost);
    
    // Navigate back to the feed
    navigate('/', { replace: true });
  };

  return <MobilePostPage onPost={handleCreatePost} />;
};

export default Compose;
