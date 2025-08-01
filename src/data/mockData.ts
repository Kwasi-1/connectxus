import { Post, User, Comment, Group, TutorProfile, MentorProfile, UserProfile, TutoringRequest, TrendingTopic, CampusHighlight } from '@/types/global';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    displayName: 'John Doe',
    email: 'john@university.edu',
    verified: true,
    followers: 1234,
    following: 567,
    university: 'Tech University',
    major: 'Computer Science',
    year: 3,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    username: 'sarahtech',
    displayName: 'Sarah Johnson',
    email: 'sarah@university.edu',
    verified: false,
    followers: 890,
    following: 234,
    university: 'Tech University',
    major: 'Data Science',
    year: 2,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date('2023-08-20')
  },
  {
    id: '3',
    username: 'alice_wonder',
    displayName: 'Alice Williams',
    email: 'alice@university.edu',
    verified: true,
    followers: 2345,
    following: 789,
    university: 'Arts College',
    major: 'Fine Arts',
    year: 4,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b8d21c?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date('2022-11-01')
  },
  {
    id: '4',
    username: 'bob_builder',
    displayName: 'Bob Miller',
    email: 'bob@university.edu',
    verified: false,
    followers: 678,
    following: 123,
    university: 'Engineering Institute',
    major: 'Civil Engineering',
    year: 1,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00d5a4ee9baa?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date('2023-05-10')
  },
  {
    id: '5',
    username: 'emily_eco',
    displayName: 'Emily Green',
    email: 'emily@university.edu',
    verified: true,
    followers: 3456,
    following: 901,
    university: 'Environmental Studies',
    major: 'Environmental Science',
    year: 2,
    avatar: 'https://images.unsplash.com/photo-1507038366474-4a63c142aa9c?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date('2022-09-22')
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '1',
      username: 'johndoe',
      displayName: 'John Doe',
      email: 'john@university.edu',
      verified: true,
      followers: 1234,
      following: 567,
      university: 'Tech University',
      major: 'Computer Science',
      year: 3,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2023-01-15')
    },
    content: 'Just finished my CS project! The debugging process was intense but totally worth it. Anyone else working on similar assignments this semester? 🎓💻',
    images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'],
    likes: 42,
    comments: 8,
    reposts: 12,
    isLiked: false,
    isReposted: false,
    createdAt: new Date('2024-01-20T10:30:00'),
  },
  {
    id: '2',
    author: {
      id: '2',
      username: 'sarahtech',
      displayName: 'Sarah Johnson',
      email: 'sarah@university.edu',
      verified: false,
      followers: 890,
      following: 234,
      university: 'Tech University',
      major: 'Data Science',
      year: 2,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2023-08-20')
    },
    content: 'Quick demo of my latest machine learning project! This model can predict student performance based on study habits. What do you think? 🤖📊',
    video: '/api/placeholder/video.mp4',
    images: ['https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&h=600&fit=crop'],
    likes: 156,
    comments: 23,
    reposts: 45,
    isLiked: true,
    isReposted: false,
    createdAt: new Date('2024-01-19T15:45:00'),
  },
  {
    id: '3',
    author: {
      id: '3',
      username: 'alice_wonder',
      displayName: 'Alice Williams',
      email: 'alice@university.edu',
      verified: true,
      followers: 2345,
      following: 789,
      university: 'Arts College',
      major: 'Fine Arts',
      year: 4,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b8d21c?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2022-11-01')
    },
    content: 'Experimenting with new color palettes for my next art installation. Feedback welcome! 🎨🖌️',
    images: [
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1588980334264-1a334a59e4ca?w=400&h=300&fit=crop'
    ],
    likes: 89,
    comments: 15,
    reposts: 22,
    isLiked: false,
    isReposted: true,
    createdAt: new Date('2024-01-18T09:12:00'),
  },
  {
    id: '4',
    author: {
      id: '4',
      username: 'bob_builder',
      displayName: 'Bob Miller',
      email: 'bob@university.edu',
      verified: false,
      followers: 678,
      following: 123,
      university: 'Engineering Institute',
      major: 'Civil Engineering',
      year: 1,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00d5a4ee9baa?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2023-05-10')
    },
    content: 'Site visit today! Checking out the progress on the new campus library. Excited to see it come to life. 🏗️📚',
    images: [
      'https://images.unsplash.com/photo-1624736077869-49f0525f4d4a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1616685085309-098114c53540?w=600&h=400&fit=crop'
    ],
    likes: 34,
    comments: 5,
    reposts: 8,
    isLiked: false,
    isReposted: false,
    createdAt: new Date('2024-01-17T16:55:00'),
  },
  {
    id: '5',
    author: {
      id: '5',
      username: 'emily_eco',
      displayName: 'Emily Green',
      email: 'emily@university.edu',
      verified: true,
      followers: 3456,
      following: 901,
      university: 'Environmental Studies',
      major: 'Environmental Science',
      year: 2,
      avatar: 'https://images.unsplash.com/photo-1507038366474-4a63c142aa9c?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2022-09-22')
    },
    content: 'Spent the day volunteering at the local park for a cleanup event. It\'s amazing what a little effort can do for our environment! 🌳🌍',
    images: [
      'https://images.unsplash.com/photo-1532980400857-89cb849e74ca?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1563982145495-559e88673d0b?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1585314064821-3c734549bbff?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584401934853-97684d566194?w=500&h=400&fit=crop'
    ],
    likes: 210,
    comments: 32,
    reposts: 67,
    isLiked: true,
    isReposted: true,
    createdAt: new Date('2024-01-16T11:00:00'),
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    author: {
      id: '2',
      username: 'sarahtech',
      displayName: 'Sarah Johnson',
      email: 'sarah@university.edu',
      verified: false,
      followers: 890,
      following: 234,
      university: 'Tech University',
      major: 'Data Science',
      year: 2,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2023-08-20')
    },
    content: 'Great job, John! Debugging is always the toughest part. What tools did you find most helpful?',
    postId: '1',
    likes: 5,
    isLiked: false,
    createdAt: new Date('2024-01-20T11:00:00'),
  },
  {
    id: '2',
    author: {
      id: '3',
      username: 'alice_wonder',
      displayName: 'Alice Williams',
      email: 'alice@university.edu',
      verified: true,
      followers: 2345,
      following: 789,
      university: 'Arts College',
      major: 'Fine Arts',
      year: 4,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b8d21c?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2022-11-01')
    },
    content: 'Sarah, your machine learning project sounds fascinating! I\'d love to see a more in-depth presentation sometime.',
    postId: '2',
    likes: 12,
    isLiked: true,
    createdAt: new Date('2024-01-19T16:30:00'),
  },
  {
    id: '3',
    author: {
      id: '1',
      username: 'johndoe',
      displayName: 'John Doe',
      email: 'john@university.edu',
      verified: true,
      followers: 1234,
      following: 567,
      university: 'Tech University',
      major: 'Computer Science',
      year: 3,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2023-01-15')
    },
    content: 'Thanks, Sarah! I mainly used VS Code for debugging. The built-in debugger is quite effective!',
    postId: '1',
    likes: 3,
    isLiked: false,
    createdAt: new Date('2024-01-20T11:15:00'),
  },
  {
    id: '4',
    author: {
      id: '4',
      username: 'bob_builder',
      displayName: 'Bob Miller',
      email: 'bob@university.edu',
      verified: false,
      followers: 678,
      following: 123,
      university: 'Engineering Institute',
      major: 'Civil Engineering',
      year: 1,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00d5a4ee9baa?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2023-05-10')
    },
    content: 'Alice, your art installations always bring so much life to the campus. Keep up the amazing work!',
    postId: '3',
    likes: 7,
    isLiked: false,
    createdAt: new Date('2024-01-18T10:00:00'),
  },
  {
    id: '5',
    author: {
      id: '5',
      username: 'emily_eco',
      displayName: 'Emily Green',
      email: 'emily@university.edu',
      verified: true,
      followers: 3456,
      following: 901,
      university: 'Environmental Studies',
      major: 'Environmental Science',
      year: 2,
      avatar: 'https://images.unsplash.com/photo-1507038366474-4a63c142aa9c?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2022-09-22')
    },
    content: 'Bob, it\'s great to see the new library progressing. Sustainable building practices are so important for our future!',
    postId: '4',
    likes: 15,
    isLiked: true,
    createdAt: new Date('2024-01-17T17:30:00'),
  },
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'CS Study Group',
    description: 'A community for Computer Science students to share resources, discuss assignments, and collaborate on projects.',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop',
    members: 234,
    isJoined: true,
    isPrivate: false,
    university: 'Tech University',
    category: 'Study Group',
    createdAt: new Date('2023-09-01')
  },
  {
    id: '2',
    name: 'Campus Basketball',
    description: 'Join us for weekly basketball games and tournaments. All skill levels welcome!',
    avatar: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop',
    members: 156,
    isJoined: false,
    isPrivate: false,
    university: 'Tech University',
    category: 'Sports',
    createdAt: new Date('2023-08-15')
  },
  {
    id: '3',
    name: 'Art Collective',
    description: 'A space for artists to showcase their work, collaborate, and organize exhibitions.',
    avatar: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=100&fit=crop',
    members: 89,
    isJoined: true,
    isPrivate: false,
    university: 'Arts College',
    category: 'Arts',
    createdAt: new Date('2023-07-20')
  },
  {
    id: '4',
    name: 'Tech Entrepreneurs',
    description: 'Network with fellow entrepreneurs, share startup ideas, and find co-founders.',
    avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
    members: 67,
    isJoined: false,
    isPrivate: true,
    university: 'Tech University',
    category: 'Professional',
    createdAt: new Date('2023-06-10')
  }
];

export const mockTutors: TutorProfile[] = [
  {
    id: '1',
    user: mockUsers[0],
    subjects: ['DCIT 101', 'Programming', 'Calculus I'],
    hourlyRate: 25,
    rating: 4.8,
    reviewCount: 24,
    availability: [
      { day: 'Monday', startTime: '2:00 PM', endTime: '5:00 PM' },
      { day: 'Wednesday', startTime: '1:00 PM', endTime: '4:00 PM' },
      { day: 'Friday', startTime: '3:00 PM', endTime: '6:00 PM' }
    ],
    description: 'Experienced CS tutor with 3+ years helping students succeed in programming and mathematics.',
    verified: true
  },
  {
    id: '2',
    user: mockUsers[1],
    subjects: ['DCIT 201', 'Statistics', 'Data Science'],
    hourlyRate: 30,
    rating: 4.9,
    reviewCount: 18,
    availability: [
      { day: 'Tuesday', startTime: '10:00 AM', endTime: '1:00 PM' },
      { day: 'Thursday', startTime: '2:00 PM', endTime: '5:00 PM' }
    ],
    description: 'Data Science major specializing in statistics and machine learning concepts.',
    verified: false
  },
  {
    id: '3',
    user: mockUsers[2],
    subjects: ['Mathematics', 'Calculus I', 'Linear Algebra'],
    hourlyRate: 22,
    rating: 4.7,
    reviewCount: 31,
    availability: [
      { day: 'Monday', startTime: '9:00 AM', endTime: '12:00 PM' },
      { day: 'Wednesday', startTime: '10:00 AM', endTime: '2:00 PM' },
      { day: 'Friday', startTime: '11:00 AM', endTime: '3:00 PM' }
    ],
    description: 'Math enthusiast helping students build strong foundations in calculus and algebra.',
    verified: true
  }
];

export const mockMentors: MentorProfile[] = [
  {
    id: '1',
    user: mockUsers[0],
    industry: 'Technology',
    company: 'Google',
    position: 'Senior Software Engineer',
    experience: 5,
    specialties: ['Software Development', 'Career Growth', 'Tech Interviews'],
    rating: 4.9,
    reviewCount: 42,
    availability: [
      { day: 'Saturday', startTime: '10:00 AM', endTime: '2:00 PM' },
      { day: 'Sunday', startTime: '1:00 PM', endTime: '4:00 PM' }
    ],
    description: 'Passionate about helping students transition from university to tech careers. Experienced in mentoring junior developers.',
    verified: true
  },
  {
    id: '2',
    user: mockUsers[1],
    industry: 'Business',
    company: 'McKinsey & Company',
    position: 'Business Analyst',
    experience: 3,
    specialties: ['Business Strategy', 'Consulting', 'Analytics'],
    rating: 4.7,
    reviewCount: 28,
    availability: [
      { day: 'Saturday', startTime: '2:00 PM', endTime: '5:00 PM' }
    ],
    description: 'Business consultant helping students develop strategic thinking and analytical skills.',
    verified: true
  },
  {
    id: '3',
    user: mockUsers[2],
    industry: 'Entrepreneurship',
    company: 'Startup Founder',
    position: 'CEO',
    experience: 7,
    specialties: ['Startup Strategy', 'Product Development', 'Fundraising'],
    rating: 4.8,
    reviewCount: 35,
    availability: [
      { day: 'Friday', startTime: '6:00 PM', endTime: '8:00 PM' },
      { day: 'Sunday', startTime: '10:00 AM', endTime: '12:00 PM' }
    ],
    description: 'Serial entrepreneur with experience building and scaling tech startups. Love helping aspiring entrepreneurs.',
    verified: true
  }
];

export const mockTrendingTopics: TrendingTopic[] = [
  {
    id: '1',
    name: '#FinalExams',
    posts: 2543,
    category: 'Academic'
  },
  {
    id: '2',
    name: '#CampusLife',
    posts: 1876,
    category: 'Social'
  },
  {
    id: '3',
    name: '#TechCareers',
    posts: 1234,
    category: 'Professional'
  },
  {
    id: '4',
    name: '#StudyTips',
    posts: 987,
    category: 'Academic'
  },
  {
    id: '5',
    name: '#Innovation',
    posts: 765,
    category: 'Technology'
  }
];

export const mockCampusHighlights: CampusHighlight[] = [
  {
    id: '1',
    title: 'New Library Opening',
    description: 'The state-of-the-art learning center opens next month with 24/7 study spaces.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop',
    university: 'Tech University',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Career Fair 2024',
    description: 'Connect with top employers and explore internship opportunities.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop',
    university: 'Tech University',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Research Symposium',
    description: 'Students present their innovative research projects and compete for awards.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    university: 'Tech University',
    createdAt: new Date('2024-01-05')
  },
  {
    id: '4',
    title: 'Spring Semester Registration',
    description: 'Course registration opens February 1st. Don\'t miss out on popular classes!',
    university: 'Tech University',
    createdAt: new Date('2024-01-01')
  }
];

export const mockUserProfile: UserProfile = {
  ...mockUsers[0],
  posts: mockPosts.slice(0, 2),
  joinedGroups: mockGroups.slice(0, 2),
  tutoringRequests: [
    {
      id: '1',
      subject: 'DCIT 101',
      description: 'Need help with programming basics',
      studentId: '1',
      tutorId: '2',
      status: 'accepted',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      subject: 'Mathematics',
      description: 'Struggling with calculus concepts',
      studentId: '1',
      status: 'pending',
      createdAt: new Date('2024-01-20')
    }
  ]
};
