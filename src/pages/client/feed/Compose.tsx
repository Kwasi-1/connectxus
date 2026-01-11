
import React, { useEffect, useState } from 'react';
import { MobilePostPage } from '@/components/post/MobilePostPage';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPost, getPostById } from '@/api/posts.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Post } from '@/types/global';

const Compose = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const quotedPostId = location.state?.quotedPostId;

  const { data: quotedPost } = useQuery({
    queryKey: ['post', quotedPostId],
    queryFn: () => getPostById(quotedPostId),
    enabled: !!quotedPostId,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; visibility?: string; quoted_post_id?: string }) =>
      createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      toast.success(quotedPostId ? 'Quote posted successfully!' : 'Post created successfully!');
      navigate('/feed', { replace: true });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  const handleCreatePost = (content: string, audience: string) => {
    const visibilityMap: Record<string, string> = {
      everyone: 'public',
      following: 'followers',
      private: 'private',
    };

    createPostMutation.mutate({
      content,
      visibility: visibilityMap[audience] || 'public',
      quoted_post_id: quotedPostId,
    });
  };

  return <MobilePostPage onPost={handleCreatePost} quotedPost={quotedPost as any} />;
};

export default Compose;
