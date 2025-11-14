
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
  admins: string[];
  moderators: string[];
}

export interface ProjectRole {
  id: string;
  name: string;
  description: string;
  slotsTotal: number;
  slotsFilled: number;
  applications: RoleApplication[];
}

export interface RoleApplication {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  roleId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: Date;
}

export interface MemberWithRole extends User {
  role?: string; }

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail: string;
  groupId: string;
  message?: string;   status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  memberCount: number;
  groupType: 'public' | 'private' | 'project';
  isJoined: boolean;
  tags: string[];
  createdAt: Date;
  createdBy: string;
  avatar?: string;
  banner?: string;
  admins: string[];
  moderators: string[];
  members?: MemberWithRole[];     requireApproval?: boolean;   allowMemberInvites?: boolean;     projectRoles?: ProjectRole[];
  projectDeadline?: Date;
  isAcceptingApplications?: boolean;
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

export interface Announcement {
  id: string;
  communityId: string;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
  isPinned: boolean;
}

export type CommunityCategory = 'Academic' | 'Level' | 'Hostel' | 'Department' | 'Faculty';

export type GroupCategory = 'Study Group' | 'Sports' | 'Arts' | 'Professional' | 'Academic' | 'Social' | 'Other';

export type HubTab = 'communities' | 'groups';

export type CommunityTab = 'posts' | 'announcements' | 'members' | 'settings';

export type GroupTab = 'members' | 'resources' | 'settings';
