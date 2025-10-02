
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
    groupType: 'public',
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
    groupType: 'public',
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
    groupType: 'private',
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
    groupType: 'public',
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
    groupType: 'private',
    isJoined: false,
    tags: ['ML', 'Research', 'AI'],
    createdAt: new Date('2024-03-05'),
    createdBy: 'user-3',
    avatar: '/placeholder.svg',
    admins: ['user-3'],
    moderators: []
  },
  {
    id: '6',
    name: 'Campus Event Planning App',
    description: 'Building a mobile app to help students discover and organize campus events.',
    category: 'Academic',
    memberCount: 5,
    groupType: 'project',
    isJoined: true,
    tags: ['Project', 'Mobile Dev', 'Team'],
    createdAt: new Date('2024-03-12'),
    createdBy: 'user-1',
    avatar: '/placeholder.svg',
    admins: ['user-1'],
    moderators: [],
    projectDeadline: new Date('2024-06-15'),
    isAcceptingApplications: true,
    projectRoles: [
      {
        id: 'role-1',
        name: 'Frontend Developer',
        description: 'React Native development for iOS and Android',
        slotsTotal: 2,
        slotsFilled: 1,
        applications: [
          {
            id: 'app-1',
            userId: 'user-2',
            userName: 'Sarah Johnson',
            userAvatar: '/placeholder.svg',
            roleId: 'role-1',
            message: 'I have 2 years of React Native experience and built 3 apps.',
            status: 'accepted',
            appliedAt: new Date('2024-03-13')
          },
          {
            id: 'app-2',
            userId: 'user-4',
            userName: 'Alex Chen',
            userAvatar: '/placeholder.svg',
            roleId: 'role-1',
            message: 'Experienced with React and willing to learn React Native.',
            status: 'pending',
            appliedAt: new Date('2024-03-14')
          }
        ]
      },
      {
        id: 'role-2',
        name: 'UI/UX Designer',
        description: 'Create wireframes, mockups, and user flows',
        slotsTotal: 1,
        slotsFilled: 0,
        applications: [
          {
            id: 'app-3',
            userId: 'user-5',
            userName: 'Emma Davis',
            userAvatar: '/placeholder.svg',
            roleId: 'role-2',
            message: 'Portfolio: behance.net/emmadavis - Specialized in mobile UI',
            status: 'pending',
            appliedAt: new Date('2024-03-15')
          }
        ]
      },
      {
        id: 'role-3',
        name: 'Backend Developer',
        description: 'Node.js API and database management',
        slotsTotal: 1,
        slotsFilled: 1,
        applications: [
          {
            id: 'app-4',
            userId: 'user-1',
            userName: 'John Doe',
            userAvatar: '/placeholder.svg',
            roleId: 'role-3',
            message: 'Project creator - handling backend',
            status: 'accepted',
            appliedAt: new Date('2024-03-12')
          }
        ]
      }
    ]
  },
  {
    id: '7',
    name: 'AI Study Assistant Bot',
    description: 'Developing an AI chatbot to help students with course materials and Q&A.',
    category: 'Academic',
    memberCount: 3,
    groupType: 'project',
    isJoined: false,
    tags: ['AI', 'Chatbot', 'Python'],
    createdAt: new Date('2024-03-08'),
    createdBy: 'user-3',
    avatar: '/placeholder.svg',
    admins: ['user-3'],
    moderators: [],
    projectDeadline: new Date('2024-05-30'),
    isAcceptingApplications: true,
    projectRoles: [
      {
        id: 'role-4',
        name: 'ML Engineer',
        description: 'Train and fine-tune language models',
        slotsTotal: 2,
        slotsFilled: 1,
        applications: []
      },
      {
        id: 'role-5',
        name: 'Full Stack Developer',
        description: 'Build web interface and integrate API',
        slotsTotal: 1,
        slotsFilled: 0,
        applications: []
      }
    ]
  },
  {
    id: '8',
    name: 'Campus Sustainability Project',
    description: 'Research and implement eco-friendly initiatives across campus.',
    category: 'Social',
    memberCount: 8,
    groupType: 'project',
    isJoined: true,
    tags: ['Sustainability', 'Research', 'Environment'],
    createdAt: new Date('2024-02-28'),
    createdBy: 'user-2',
    avatar: '/placeholder.svg',
    admins: ['user-2'],
    moderators: ['user-1'],
    projectDeadline: new Date('2024-12-01'),
    isAcceptingApplications: false,
    projectRoles: [
      {
        id: 'role-6',
        name: 'Research Lead',
        description: 'Conduct environmental impact studies',
        slotsTotal: 2,
        slotsFilled: 2,
        applications: []
      },
      {
        id: 'role-7',
        name: 'Community Outreach',
        description: 'Engage students and organize awareness campaigns',
        slotsTotal: 3,
        slotsFilled: 3,
        applications: []
      },
      {
        id: 'role-8',
        name: 'Data Analyst',
        description: 'Analyze sustainability metrics and create reports',
        slotsTotal: 1,
        slotsFilled: 1,
        applications: []
      }
    ]
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
