
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  verified: boolean;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  images?: string[];
  likes: number;
  reposts: number;
  comments: number;
  isLiked: boolean;
  isReposted: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  createdAt: Date;
  likes: number;
  isLiked: boolean;
}

export interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  posts: number;
}

export interface CampusHighlight {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'repost' | 'comment' | 'follow' | 'mention';
  user: User;
  action: string;
  content?: string;
  time: string;
  read: boolean;
}

export type ExploreTab = 'for-you' | 'trending' | 'news' | 'sports' | 'entertainment';
export type NotificationTab = 'all' | 'verified' | 'mentions';

export interface NewsItem {
  id: string;
  category: string;
  title: string;
  posts: string;
  time: string;
  images?: string[];
}

export interface TrendingItem {
  topic: string;
  location?: string;
  category?: string;
  posts?: string;
}
