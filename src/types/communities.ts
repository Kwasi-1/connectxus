
import { User } from '@/types/global';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  memberCount: number;
  coverImage?: string;
  isJoined: boolean;
  createdAt: Date;
  level?: string;
  department?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  memberCount: number;
  isPrivate: boolean;
  isJoined: boolean;
  tags: string[];
  createdAt: Date;
  createdBy: string;
  avatar?: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  author: User;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isReposted: boolean;
  createdAt: Date;
}

export type CommunityCategory = 'Academic' | 'Level' | 'Hostel' | 'Department' | 'Faculty';

export type GroupCategory = 'Study Group' | 'Sports' | 'Arts' | 'Professional' | 'Academic' | 'Social' | 'Other';

export type HubTab = 'my' | 'explore';
