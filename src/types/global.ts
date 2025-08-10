
// Global types for Campus Vibe Net

export type UserRole = 'student' | 'tutor' | 'mentor' | 'ta' | 'lecturer' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

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
  // New authentication fields
  roles: UserRole[];
  department?: string;
  level?: string;
  mentorStatus?: ApprovalStatus;
  tutorStatus?: ApprovalStatus;
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
  quotes: number;
  isLiked: boolean;
  isReposted: boolean;
  quotedPost?: Post;
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

export interface MentorProfile {
  id: string;
  user: User;
  industry: string;
  company?: string;
  position?: string;
  experience: number;
  specialties: string[];
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

export type GroupCategory = 
  | 'Academic'
  | 'Sports'
  | 'Arts'
  | 'Technology'
  | 'Social'
  | 'Professional'
  | 'Study Group'
  | 'Other';

export type NotificationType = 
  | 'like'
  | 'comment'
  | 'repost'
  | 'follow'
  | 'mention'
  | 'message'
  | 'group_invite'
  | 'tutoring_request'
  | 'mentor_request';

export interface Notification {
  id: string;
  type: NotificationType;
  from: User;
  to: User;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string; // ID of related post, message, etc.
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

export type ExploreTab = 'for-you' | 'trending' | 'news' | 'sports' | 'entertainment';

export type NotificationTab = 'all' | 'verified' | 'mentions';

export interface UserProfile extends User {
  posts: Post[];
  joinedGroups: Group[];
  tutoringRequests: TutoringRequest[];
  mentorProfile?: MentorProfile;
}

export interface TutoringRequest {
  id: string;
  subject: string;
  description: string;
  studentId: string;
  tutorId?: string;
  status: 'pending' | 'accepted' | 'completed';
  createdAt: Date;
}
