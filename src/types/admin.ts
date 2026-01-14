import { User } from "@/types/global";

export type AdminRole = "admin" | "super_admin";

export type AdminPermission =
  | "user_management"
  | "content_management"
  | "community_management"
  | "tutoring_management"
  | "analytics"
  | "admin_management"
  | "system_settings"
  | "reports"
  | "notifications";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  avatar?: string;
  university?: string;
  department?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdBy?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ContentModerationItem {
  id: string;
  type: "post" | "comment" | "group" | "event" | "announcement";
  contentId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "removed";
  priority: "low" | "medium" | "high" | "urgent";
  reviewedBy?: string;
  reviewedAt?: Date;
  moderationNotes?: string;
  content: {
    text?: string;
    images?: string[];
    author: User;
    likes?: number;
    comments?: number;
    shares?: number;
    replies?: number;
    members?: number;
    posts?: number;
    createdAt?: Date;
  };
  createdAt: Date;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  type: "general" | "academic" | "social" | "emergency" | "maintenance";
  targetAudience: string[];
  priority: "low" | "medium" | "high" | "urgent";
  scheduledFor?: Date;
  expiresAt?: Date;
  status: "draft" | "scheduled" | "published" | "expired";
  authorId: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category:
    | "academic"
    | "social"
    | "sports"
    | "cultural"
    | "professional"
    | "other";
  location: string;
  startDate: Date;
  endDate: Date;
  maxAttendees?: number;
  currentAttendees: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  status: "draft" | "published" | "cancelled" | "completed";
  organizer: string;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupManagement {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  status:
    | "active"
    | "suspended"
    | "archived"
    | "pending"
    | "approved"
    | "rejected";
  visibility: "public" | "private" | "restricted";
  createdBy: string;
  moderators: string[];
  flags: number;
  lastActivity: Date;
  createdAt: Date;
  avatarUrl?: string;
}

export interface TutorApplication {
  id: string;
  applicant_id: string;
  full: string;
  subject: string;
  hourlyRate?: number;
  qualifications: string;
  experience: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewerNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalGroups: number;
  totalEvents: number;
  reportedContent: number;
  pendingApplications: number;
  systemHealth: "good" | "warning" | "critical";
  lastUpdated: Date;
}

export interface AdminNotification {
  id: string;
  type: "report" | "application" | "system" | "user_activity";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  actionRequired: boolean;
  relatedId?: string;
  createdAt: Date;
}

export interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  signOut: () => void;
  hasPermission: (permission: AdminPermission) => boolean;
  hasRole: (role: AdminRole) => boolean;
  selectedSpaceId: string | null;
  setSelectedSpaceId: (spaceId: string | null) => void;
}
