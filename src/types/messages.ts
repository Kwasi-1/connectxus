
export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
  isPinned: boolean;
  phone?: string;
  lastMessageTime: number;
}

export interface GroupChat {
  id: string;
  name: string;
  avatar: string;
  description: string;
  memberCount: number;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: GroupMessage[];
  isPinned: boolean;
  lastMessageTime: number;
  isAdmin: boolean;
  isModerator: boolean;
  members: GroupMember[];
}

export interface GroupMessage {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isOwn: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  isOnline: boolean;
  joinedAt: Date;
}

export type MessageTab = 'all' | 'groups';
