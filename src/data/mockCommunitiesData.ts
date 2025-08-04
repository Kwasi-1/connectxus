
import { Community, Group } from '@/types/communities';

export const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Computer Science Students',
    description: 'A community for all computer science majors to share resources, discuss projects, and connect with peers.',
    category: 'Academic',
    memberCount: 1247,
    avatar: '/placeholder.svg',
    isJoined: false,
    createdAt: new Date('2024-01-15'),
    posts: [
      {
        id: 'c1-p1',
        content: 'Anyone working on machine learning projects this semester? Would love to collaborate!',
        author: {
          id: '1',
          name: 'Alex Chen',
          username: '@alexchen',
          avatar: '/placeholder.svg'
        },
        createdAt: new Date('2024-02-01'),
        likes: 15,
        replies: 8,
        isLiked: false
      },
      {
        id: 'c1-p2',
        content: 'Great resources for data structures and algorithms practice: LeetCode, HackerRank, and Cracking the Coding Interview book.',
        author: {
          id: '2',
          name: 'Sarah Johnson',
          username: '@sarahj',
          avatar: '/placeholder.svg'
        },
        createdAt: new Date('2024-01-28'),
        likes: 42,
        replies: 12,
        isLiked: true
      }
    ]
  },
  {
    id: '2',
    name: 'Business Administration Hub',
    description: 'Connect with fellow business students, share internship opportunities, and discuss industry trends.',
    category: 'Academic',
    memberCount: 892,
    avatar: '/placeholder.svg',
    isJoined: true,
    createdAt: new Date('2024-01-20'),
    posts: [
      {
        id: 'c2-p1',
        content: 'Just got accepted for a summer internship at Goldman Sachs! Happy to share tips for finance applications.',
        author: {
          id: '3',
          name: 'Michael Brown',
          username: '@mikebrown',
          avatar: '/placeholder.svg'
        },
        createdAt: new Date('2024-02-02'),
        likes: 28,
        replies: 15,
        isLiked: false
      }
    ]
  },
  {
    id: '3',
    name: 'Engineering Society',
    description: 'All engineering disciplines welcome! Share projects, get help with coursework, and network.',
    category: 'Academic',
    memberCount: 2156,
    avatar: '/placeholder.svg',
    isJoined: false,
    createdAt: new Date('2024-01-10'),
    posts: []
  },
  {
    id: '4',
    name: 'Campus Life & Events',
    description: 'Stay updated on campus events, activities, and student life happenings.',
    category: 'Social',
    memberCount: 3421,
    avatar: '/placeholder.svg',
    isJoined: true,
    createdAt: new Date('2024-01-05'),
    posts: []
  },
  {
    id: '5',
    name: 'International Students',
    description: 'A supportive community for international students to connect and share experiences.',
    category: 'Social',
    memberCount: 756,
    avatar: '/placeholder.svg',
    isJoined: false,
    createdAt: new Date('2024-01-12'),
    posts: []
  }
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'React Study Group',
    description: 'Weekly meetups to learn React.js, work on projects together, and share knowledge.',
    category: 'Study Group',
    memberCount: 24,
    maxMembers: 30,
    isPrivate: false,
    avatar: '/placeholder.svg',
    tags: ['React', 'JavaScript', 'Frontend'],
    isJoined: true,
    isCreator: false,
    createdAt: new Date('2024-01-25'),
    creator: {
      id: '1',
      name: 'Alex Chen',
      username: '@alexchen',
      avatar: '/placeholder.svg'
    }
  },
  {
    id: '2',
    name: 'Data Science Research Team',
    description: 'Advanced group for data science research projects and paper discussions.',
    category: 'Academic',
    memberCount: 12,
    maxMembers: 15,
    isPrivate: true,
    avatar: '/placeholder.svg',
    tags: ['Data Science', 'Research', 'Machine Learning'],
    isJoined: false,
    isCreator: false,
    createdAt: new Date('2024-01-18'),
    creator: {
      id: '5',
      name: 'Dr. Emily Wilson',
      username: '@emilyw',
      avatar: '/placeholder.svg'
    }
  },
  {
    id: '3',
    name: 'Photography Club',
    description: 'Share your photography, get feedback, and organize photo walks around campus.',
    category: 'Arts',
    memberCount: 67,
    maxMembers: 100,
    isPrivate: false,
    avatar: '/placeholder.svg',
    tags: ['Photography', 'Arts', 'Creative'],
    isJoined: false,
    isCreator: false,
    createdAt: new Date('2024-01-22'),
    creator: {
      id: '6',
      name: 'Lisa Wang',
      username: '@lisawang',
      avatar: '/placeholder.svg'
    }
  },
  {
    id: '4',
    name: 'Startup Founders Circle',
    description: 'Exclusive group for students working on startup ideas. Share resources and get mentorship.',
    category: 'Professional',
    memberCount: 18,
    maxMembers: 25,
    isPrivate: true,
    avatar: '/placeholder.svg',
    tags: ['Startup', 'Entrepreneurship', 'Business'],
    isJoined: true,
    isCreator: true,
    createdAt: new Date('2024-01-30'),
    creator: {
      id: '1', // Current user
      name: 'John Doe',
      username: '@johndoe',
      avatar: '/placeholder.svg'
    }
  },
  {
    id: '5',
    name: 'Chess Tournament Prep',
    description: 'Practice games and strategy discussions for upcoming chess tournaments.',
    category: 'Sports',
    memberCount: 15,
    maxMembers: 20,
    isPrivate: false,
    avatar: '/placeholder.svg',
    tags: ['Chess', 'Strategy', 'Tournament'],
    isJoined: false,
    isCreator: false,
    createdAt: new Date('2024-02-01'),
    creator: {
      id: '7',
      name: 'David Lee',
      username: '@davidlee',
      avatar: '/placeholder.svg'
    }
  }
];
