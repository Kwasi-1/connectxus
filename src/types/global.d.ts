export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  followers: number;
  following: number;
  university?: string;
  major?: string;
  year?: number;
  createdAt: Date;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  images?: string[];
  video?: string;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isReposted: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  postId: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  members: number;
  isJoined: boolean;
  isPrivate: boolean;
  university?: string;
  category: GroupCategory;
  createdAt: Date;
}

export interface TutorProfile {
  id: string;
  user: User;
  subjects: string[];
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  availability: TimeSlot[];
  description: string;
  verified: boolean;
}

export interface Message {
  id: string;
  sender: User;
  recipient: User;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: Date;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface TrendingTopic {
  id: string;
  name: string;
  posts: number;
  category?: string;
}

export interface CampusHighlight {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  university?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  from: User;
  to: User;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string;
}

export interface ExplorePost extends Post {
  category: "trending" | "news" | "sports" | "entertainment";
}

export interface SearchResult {
  id: string;
  type: "user" | "post" | "topic";
  content: string;
  relevance: number;
}

export type GroupCategory =
  | "Academic"
  | "Sports"
  | "Arts"
  | "Technology"
  | "Social"
  | "Professional"
  | "Study Group"
  | "Other";

export type NotificationType =
  | "like"
  | "comment"
  | "repost"
  | "follow"
  | "mention"
  | "message"
  | "group_invite"
  | "tutoring_request"

export type FeedFilter = "all" | "following";
export type ExploreTab =
  | "for-you"
  | "trending"
  | "news"
  | "sports"
  | "entertainment";
export type NotificationTab = "all" | "verified" | "mentions";
