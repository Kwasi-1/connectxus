
import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Repeat2, Share, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Comment } from './Comment';
import { Post, Comment as CommentType } from '@/types/global';
import { mockComments, mockUsers } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FullScreenPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onShare: (postId: string) => void;
}

export function FullScreenPostModal({
  isOpen,
  onClose,
  post,
  onLike,
  onComment,
  onRepost,
  onShare
}: FullScreenPostModalProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Simulate fetching comments
      const postComments = mockComments.filter(c => c.postId === post.id);
      setComments(postComments);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, post.id]);

  if (!isOpen) return null;

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
    if (!newComment.trim()) return;

    const comment: CommentType = {
      id: Date.now().toString(),
      author: mockUsers[0],
      content: newComment,
      postId: post.id,
      likes: 0,
      isLiked: false,
      createdAt: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const nextImage = () => {
    if (post.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const renderMedia = () => {
    if (post.video) {
      return (
        <div className="flex-1 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <video 
            className="max-w-full max-h-full object-contain"
            controls
            autoPlay
          >
            <source src={post.video} type="video/mp4" />
          </video>
        </div>
      );
    }

    if (post.images && post.images.length > 0) {
      return (
        <div className="flex-1 flex items-center justify-center bg-black/85 backdrop-blur-sm relative">
          <img 
            src={post.images[currentImageIndex]} 
            alt="Post content" 
            className="max-w-full max-h-full object-contain"
          />
          
          {post.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-secondary/50 rounded-full text-white hover:bg-secondary/70"
                onClick={prevImage}
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-secondary/50 rounded-full text-white hover:bg-secondary/70"
                onClick={nextImage}
                disabled={currentImageIndex === post.images.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {post.images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm">
      <div className="h-full flex">
        {/* Media Section */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="absolute z-40 flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Media Content */}
          {renderMedia()}
        </div>

        {/* Comments Section */}
        <div className="hidden w-80 lg:w-full max-w-md bg-background border-l border-border lg:flex flex-col">
          {/* Post Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>
                  {post.author.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-foreground">{post.author.displayName}</span>
                  {post.author.verified && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                  <span className="text-muted-foreground">@{post.author.username}</span>
                </div>
                
                <p className="text-foreground mt-2">{post.content}</p>
                
                {/* Interaction Buttons */}
                <div className="flex items-center space-x-6 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onComment(post.id)}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-full"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{post.comments || 0}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRepost(post.id)}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-full",
                      post.isReposted 
                        ? "text-green-500 bg-green-500/10" 
                        : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                    )}
                  >
                    <Repeat2 className="h-5 w-5" />
                    <span className="text-sm">{post.reposts || 0}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLike(post.id)}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-full",
                      post.isLiked 
                        ? "text-red-500 bg-red-500/10" 
                        : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    )}
                  >
                    <Heart className={cn(
                      "h-5 w-5",
                      post.isLiked && "fill-current"
                    )} />
                    <span className="text-sm">{post.likes || 0}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare(post.id)}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-full"
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Reply Composer */}
          <div className="p-4 border-b border-border">
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={mockUsers[0].avatar} />
                <AvatarFallback>
                  {mockUsers[0].displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  placeholder="Post your reply"
                  className="w-full px-3 py-2 text-sm bg-transparent text-foreground placeholder-muted-foreground resize-none border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto">
            {comments.length > 0 ? (
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
      </div>
    </div>
  );
}
