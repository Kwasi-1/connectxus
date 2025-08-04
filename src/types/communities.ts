
export type CommunityCategory = 'Academic' | 'Social' | 'Professional' | 'Sports' | 'Arts' | 'Technology' | 'Other';
export type GroupCategory = 'Academic' | 'Study Group' | 'Professional' | 'Social' | 'Sports' | 'Arts' | 'Technology' | 'Other';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface CommunityPost {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  likes: number;
  replies: number;
  isLiked: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  memberCount: number;
  avatar: string;
  isJoined: boolean;
  createdAt: Date;
  posts: CommunityPost[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  memberCount: number;
  maxMembers?: number;
  isPrivate: boolean;
  avatar: string;
  tags: string[];
  isJoined: boolean;
  isCreator: boolean;
  createdAt: Date;
  creator: User;
}
