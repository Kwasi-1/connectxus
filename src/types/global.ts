export type UserRole =
  | "user"
  | "super_admin"
  | "admin"
  | "support_staff"
  | "content_moderator"
  | "finance_officer"
  | "operations_manager"
  | "developer_admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  cover_image?: string;
  bio?: string;
  verified: boolean;
  followers: number;
  following: number;
  space_id?: string;
  space_name?: string;
  department_id?: string;
  department_id_2?: string;
  department_id_3?: string;
  department_name?: string;
  department_name_2?: string;
  department_name_3?: string;
  department?: string;
  level?: string;
  createdAt: Date;
  role: string;
  isActive?: boolean;
  status?: string;
  auth_provider?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  images?: string[];
  media?: string[];
  video?: string;
  likes: number;
  comments: number;
  reposts: number;
  quotes: number;
  isLiked: boolean;
  isReposted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  quotedPost?: Post;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  postId: string;
  parentCommentId?: string | null;
  likes: number;
  isLiked: boolean;
  repliesCount?: number; 
  createdAt: Date;
  depth?: number; 
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
  | "tutoring_request";

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

export type ExploreTab =
  | "for-you"
  | "trending"
  | "news"
  | "sports"
  | "entertainment";

export type NotificationTab = "all" | "verified" | "mentions";

export interface UserProfile extends User {
  posts: Post[];
  joinedGroups: Group[];
  tutoringRequests: TutoringRequest[];
}

export interface TutoringRequest {
  id: string;
  subject: string;
  description: string;
  studentId: string;
  tutorId?: string;
  status: "pending" | "accepted" | "completed";
  createdAt: Date;
}

export interface PublicPageProps {
  title: string;
  description?: string;
}

export interface FooterLink {
  name: string;
  path: string;
}

export interface LandingPageState {
  isSignUp: boolean;
}

export interface ContactMethod {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface DownloadPlatform {
  id: string;
  name: string;
  platforms: string[];
  icon: string;
}
