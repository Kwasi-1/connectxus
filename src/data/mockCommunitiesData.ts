
import { Community, Group, CommunityPost } from '@/types/communities';
import { User } from '@/types/global';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'john_cs',
    displayName: 'John Doe',
    email: 'john@university.edu',
    avatar: '/placeholder.svg',
    verified: false,
    followers: 234,
    following: 180,
    createdAt: new Date('2024-01-01'),
    roles: ['student']
  },
  {
    id: 'user-2',
    username: 'sarah_dev',
    displayName: 'Sarah Johnson',
    email: 'sarah@university.edu',
    avatar: '/placeholder.svg',
    verified: true,
    followers: 567,
    following: 234,
    createdAt: new Date('2024-01-05'),
    roles: ['student']
  },
  {
    id: 'user-3',
    username: 'admin_mike',
    displayName: 'Mike Wilson',
    email: 'mike@university.edu',
    avatar: '/placeholder.svg',
    verified: true,
    followers: 1200,
    following: 456,
    createdAt: new Date('2024-01-01'),
    roles: ['admin']
  }
];

export const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Computer Science Department',
    description: 'Connect with fellow CS students, share projects, and collaborate on assignments.',
    category: 'Academic',
    memberCount: 1247,
    coverImage: '/placeholder.svg',
    isJoined: true,
    createdAt: new Date('2024-01-15'),
    level: '100-400',
    department: 'Computer Science',
    admins: ['user-1', 'user-3'],
    moderators: ['user-2']
  },
  {
    id: '2',
    name: 'Engineering Faculty',
    description: 'All engineering students unite! Share resources, study materials, and project ideas.',
    category: 'Academic',
    memberCount: 3456,
    coverImage: '/placeholder.svg',
    isJoined: false,
    createdAt: new Date('2024-02-01'),
    level: 'All',
    department: 'Engineering',
    admins: ['user-3'],
    moderators: []
  },
  {
    id: '3',
    name: 'Level 200 Students',
    description: 'Second-year students community for academic support and social connections.',
    category: 'Level',
    memberCount: 892,
    coverImage: '/placeholder.svg',
    isJoined: true,
    createdAt: new Date('2024-01-20'),
    level: '200',
    department: 'All',
    admins: ['user-2'],
    moderators: ['user-1']
  },
  {
    id: '4',
    name: 'Volta Hall Community',
    description: 'Students residing in Volta Hall. Share hall updates and connect with hall mates.',
    category: 'Hostel',
    memberCount: 234,
    coverImage: '/placeholder.svg',
    isJoined: true,
    createdAt: new Date('2024-01-10'),
    level: 'All',
    department: 'All',
    admins: ['user-3'],
    moderators: []
  },
  {
    id: '5',
    name: 'Business School',
    description: 'Future business leaders network and share opportunities.',
    category: 'Academic',
    memberCount: 678,
    coverImage: '/placeholder.svg',
    isJoined: false,
    createdAt: new Date('2024-02-10'),
    level: 'All',
    department: 'Business',
    admins: ['user-2'],
    moderators: []
  }
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Study Squad - Data Structures',
    description: 'Weekly study sessions for Data Structures and Algorithms course.',
    category: 'Study Group',
    memberCount: 23,
    isPrivate: false,
    isJoined: true,
    tags: ['Study', 'CS', 'Algorithms'],
    createdAt: new Date('2024-03-01'),
    createdBy: 'user-1',
    avatar: '/placeholder.svg',
    admins: ['user-1'],
    moderators: ['user-2']
  },
  {
    id: '2',
    name: 'Chess Club',
    description: 'University chess enthusiasts. Weekly tournaments and casual games.',
    category: 'Sports',
    memberCount: 67,
    isPrivate: false,
    isJoined: false,
    tags: ['Chess', 'Games', 'Competition'],
    createdAt: new Date('2024-02-15'),
    createdBy: 'user-2',
    avatar: '/placeholder.svg',
    admins: ['user-2'],
    moderators: []
  },
  {
    id: '3',
    name: 'Tech Startup Ideas',
    description: 'Brainstorm and develop innovative tech startup concepts.',
    category: 'Professional',
    memberCount: 45,
    isPrivate: true,
    isJoined: true,
    tags: ['Startup', 'Tech', 'Innovation'],
    createdAt: new Date('2024-03-10'),
    createdBy: 'user-3',
    avatar: '/placeholder.svg',
    admins: ['user-3'],
    moderators: ['user-1']
  },
  {
    id: '4',
    name: 'Photography Society',
    description: 'Capture campus life and improve photography skills together.',
    category: 'Arts',
    memberCount: 89,
    isPrivate: false,
    isJoined: false,
    tags: ['Photography', 'Art', 'Creative'],
    createdAt: new Date('2024-02-20'),
    createdBy: 'user-2',
    avatar: '/placeholder.svg',
    admins: ['user-2'],
    moderators: []
  },
  {
    id: '5',
    name: 'Machine Learning Research',
    description: 'Advanced ML research group for graduate students.',
    category: 'Academic',
    memberCount: 12,
    isPrivate: true,
    isJoined: false,
    tags: ['ML', 'Research', 'AI'],
    createdAt: new Date('2024-03-05'),
    createdBy: 'user-3',
    avatar: '/placeholder.svg',
    admins: ['user-3'],
    moderators: []
  }
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    communityId: '1',
    author: mockUsers[0],
    content: 'Just finished my final project for Software Engineering! Anyone else excited for the demo day?',
    images: ['/placeholder.svg'],
    likes: 23,
    comments: 8,
    reposts: 3,
    isLiked: false,
    isReposted: false,
    createdAt: new Date('2024-03-15')
  },
  {
    id: '2',
    communityId: '1',
    author: mockUsers[1],
    content: 'Looking for teammates for the upcoming hackathon! I have experience with React and Node.js. DM me!',
    likes: 45,
    comments: 15,
    reposts: 7,
    isLiked: true,
    isReposted: false,
    createdAt: new Date('2024-03-14')
  },
  {
    id: '3',
    communityId: '2',
    author: mockUsers[2],
    content: 'New engineering lab equipment has arrived! Check out the announcement for booking slots.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    likes: 67,
    comments: 23,
    reposts: 12,
    isLiked: false,
    isReposted: true,
    createdAt: new Date('2024-03-13')
  }
];

export const mockAnnouncements = [
  {
    id: '1',
    communityId: '1',
    title: 'New Course Registration Opens',
    content: 'Registration for the new semester opens next Monday. Make sure to check your prerequisites.',
    author: mockUsers[2],
    createdAt: new Date('2024-03-10'),
    isPinned: true
  },
  {
    id: '2',
    communityId: '1',
    title: 'Lab Schedule Changes',
    content: 'Due to maintenance, Lab A will be closed on Friday. Please use Lab B instead.',
    author: mockUsers[1],
    createdAt: new Date('2024-03-08'),
    isPinned: false
  }
];
