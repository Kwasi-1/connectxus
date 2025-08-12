
import { GroupChat, GroupMessage, GroupMember, Chat, Message } from '@/types/messages';

export const mockGroupMembers: GroupMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    role: 'admin',
    isOnline: true,
    joinedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    role: 'moderator',
    isOnline: false,
    joinedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    role: 'member',
    isOnline: true,
    joinedAt: new Date('2024-01-03')
  },
  {
    id: '4',
    name: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    role: 'member',
    isOnline: false,
    joinedAt: new Date('2024-01-04')
  }
];

export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2 min ago',
    unreadCount: 2,
    isOnline: true,
    isPinned: false,
    phone: '+1234567890',
    lastMessageTime: Date.now() - 120000,
    messages: [
      {
        id: '1',
        content: 'Hey there!',
        timestamp: '10:00 AM',
        senderId: 'chat-1',
        senderName: 'Alice Johnson',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        isOwn: false
      },
      {
        id: '2',
        content: 'Hi Alice! How are you?',
        timestamp: '10:01 AM',
        senderId: 'current-user',
        senderName: 'You',
        isOwn: true
      },
      {
        id: '3',
        content: 'Hey, how are you doing?',
        timestamp: '10:05 AM',
        senderId: 'chat-1',
        senderName: 'Alice Johnson',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        isOwn: false
      }
    ]
  },
  {
    id: 'chat-2',
    name: 'Bob Smith',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    lastMessage: 'Thanks for the help!',
    timestamp: '1 hour ago',
    unreadCount: 0,
    isOnline: false,
    isPinned: true,
    phone: '+1987654321',
    lastMessageTime: Date.now() - 3600000,
    messages: [
      {
        id: '1',
        content: 'Can you help me with this project?',
        timestamp: 'Yesterday',
        senderId: 'chat-2',
        senderName: 'Bob Smith',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        isOwn: false
      },
      {
        id: '2',
        content: 'Thanks for the help!',
        timestamp: '1 hour ago',
        senderId: 'chat-2',
        senderName: 'Bob Smith',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        isOwn: false
      }
    ]
  }
];

export const mockGroupChats: GroupChat[] = [
  {
    id: 'group-1',
    name: 'CS Study Group',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop',
    description: 'Computer Science study group for final exams',
    memberCount: 12,
    lastMessage: 'Anyone free for study session tomorrow?',
    timestamp: '5 min ago',
    unreadCount: 3,
    isPinned: true,
    lastMessageTime: Date.now() - 300000,
    isAdmin: true,
    isModerator: false,
    members: mockGroupMembers,
    messages: [
      {
        id: '1',
        content: 'Hey everyone! Ready for the algorithms exam?',
        timestamp: '10:00 AM',
        senderId: '1',
        senderName: 'Sarah Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        isOwn: false
      },
      {
        id: '2',
        content: 'I need help with dynamic programming!',
        timestamp: '10:01 AM',
        senderId: 'current-user',
        senderName: 'You',
        isOwn: true
      },
      {
        id: '3',
        content: 'I can help with that! Let\'s meet in the library',
        timestamp: '10:02 AM',
        senderId: '2',
        senderName: 'John Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        isOwn: false
      },
      {
        id: '4',
        content: 'Anyone free for study session tomorrow?',
        timestamp: '10:05 AM',
        senderId: '3',
        senderName: 'Emma Wilson',
        senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        isOwn: false
      }
    ]
  },
  {
    id: 'group-2',
    name: 'Engineering Faculty',
    avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop',
    description: 'Official Engineering Faculty discussion group',
    memberCount: 156,
    lastMessage: 'New lab schedule posted',
    timestamp: '2 hours ago',
    unreadCount: 1,
    isPinned: false,
    lastMessageTime: Date.now() - 7200000,
    isAdmin: false,
    isModerator: true,
    members: mockGroupMembers.slice(0, 3),
    messages: [
      {
        id: '1',
        content: 'Welcome to the Engineering Faculty group!',
        timestamp: '9:00 AM',
        senderId: '1',
        senderName: 'Sarah Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        isOwn: false
      },
      {
        id: '2',
        content: 'New lab schedule posted',
        timestamp: '11:00 AM',
        senderId: '2',
        senderName: 'John Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        isOwn: false
      }
    ]
  },
  {
    id: 'group-3',
    name: 'Project Team Alpha',
    avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
    description: 'Final year project collaboration',
    memberCount: 5,
    lastMessage: 'Meeting at 3 PM today',
    timestamp: '1 day ago',
    unreadCount: 0,
    isPinned: true,
    lastMessageTime: Date.now() - 86400000,
    isAdmin: false,
    isModerator: false,
    members: mockGroupMembers.slice(0, 2),
    messages: [
      {
        id: '1',
        content: 'Let\'s discuss the project timeline',
        timestamp: 'Yesterday',
        senderId: '3',
        senderName: 'Emma Wilson',
        senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        isOwn: false
      },
      {
        id: '2',
        content: 'Meeting at 3 PM today',
        timestamp: 'Yesterday',
        senderId: '4',
        senderName: 'Mike Johnson',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        isOwn: false
      }
    ]
  }
];
