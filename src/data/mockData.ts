import { User, Post, TrendingTopic, CampusHighlight, Comment, Group, TutorProfile, MentorProfile, TutoringRequest, UserProfile } from '@/types/global';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'sarah_chen',
    displayName: 'Sarah Chen',
    email: 'sarah@university.edu',
    avatar: '/api/placeholder/40/40',
    bio: 'Computer Science • Class of 2025 • Coffee enthusiast ☕',
    verified: true,
    followers: 1234,
    following: 567,
    university: 'Tech University',
    major: 'Computer Science',
    year: 3,
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    username: 'mike_johnson',
    displayName: 'Mike Johnson',
    email: 'mike@university.edu',
    bio: 'Engineering Student • Basketball Team Captain 🏀',
    verified: false,
    followers: 890,
    following: 234,
    university: 'Tech University',
    major: 'Mechanical Engineering',
    year: 2,
    createdAt: new Date('2023-03-20')
  },
  {
    id: '3',
    username: 'prof_davis',
    displayName: 'Dr. Emily Davis',
    email: 'davis@university.edu',
    bio: 'Professor of Psychology • Research in Cognitive Science',
    verified: true,
    followers: 3456,
    following: 123,
    university: 'Tech University',
    createdAt: new Date('2020-08-10')
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    content: "Just finished my final project for CS 401! 🎉 Building a machine learning model to predict student success rates. The data patterns are fascinating!",
    likes: 42,
    comments: 8,
    reposts: 5,
    isLiked: false,
    isReposted: false,
    createdAt: new Date('2024-01-31T10:30:00'),
  },
  {
    id: '2',
    author: mockUsers[1],
    content: "Big game tomorrow against State University! 🏀 Come out and support the team at 7 PM in the campus gym. We need all the energy we can get!",
    likes: 127,
    comments: 23,
    reposts: 15,
    isLiked: true,
    isReposted: false,
    createdAt: new Date('2024-01-31T08:15:00'),
  },
  {
    id: '3',
    author: mockUsers[2],
    content: "Reminder: Office hours today 2-4 PM for anyone struggling with the midterm material. Psychology Building, Room 205. Don't hesitate to ask questions!",
    likes: 89,
    comments: 12,
    reposts: 8,
    isLiked: false,
    isReposted: true,
    createdAt: new Date('2024-01-31T07:45:00'),
  },
  {
    id: '4',
    author: mockUsers[0],
    content: "Looking for study partners for Data Structures exam next week. Anyone interested in forming a study group? We could meet at the library!",
    likes: 34,
    comments: 16,
    reposts: 3,
    isLiked: true,
    isReposted: false,
    createdAt: new Date('2024-01-30T19:20:00'),
  }
];

export const mockTrendingTopics: TrendingTopic[] = [
  { id: '1', name: '#FinalExams', posts: 1234, category: 'Academic' },
  { id: '2', name: '#CampusLife', posts: 892, category: 'Social' },
  { id: '3', name: '#StudyTips', posts: 567, category: 'Academic' },
  { id: '4', name: '#TechUniversity', posts: 445, category: 'University' },
  { id: '5', name: '#Basketball', posts: 334, category: 'Sports' }
];

export const mockCampusHighlights: CampusHighlight[] = [
  {
    id: '1',
    title: 'Spring Career Fair',
    description: 'Connect with top employers on campus',
    university: 'Tech University',
    createdAt: new Date('2024-02-01')
  },
  {
    id: '2',
    title: 'New Library Hours',
    description: 'Extended hours during finals week',
    university: 'Tech University',
    createdAt: new Date('2024-01-30')
  },
  {
    id: '3',
    title: 'Research Symposium',
    description: 'Undergraduate research presentations',
    university: 'Tech University',
    createdAt: new Date('2024-01-28')
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    author: mockUsers[1],
    content: "Great work on the ML project! I'd love to hear more about the data preprocessing steps you used.",
    likes: 12,
    isLiked: false,
    createdAt: new Date('2024-01-31T11:15:00'),
  },
  {
    id: '2',
    postId: '1',
    author: mockUsers[2],
    content: "This sounds fascinating! Have you considered publishing your findings in the student research journal?",
    likes: 8,
    isLiked: true,
    createdAt: new Date('2024-01-31T11:45:00'),
  },
  {
    id: '3',
    postId: '2',
    author: mockUsers[0],
    content: "Can't wait for the game! The team has been practicing hard. 🏀",
    likes: 15,
    isLiked: false,
    createdAt: new Date('2024-01-31T08:30:00'),
  },
  {
    id: '4',
    postId: '2',
    author: mockUsers[2],
    content: "I'll be there cheering you on! Go team!",
    likes: 6,
    isLiked: false,
    createdAt: new Date('2024-01-31T08:45:00'),
  },
  {
    id: '5',
    postId: '3',
    author: mockUsers[0],
    content: "Thank you Dr. Davis! Your office hours always help clarify the material.",
    likes: 5,
    isLiked: true,
    createdAt: new Date('2024-01-31T08:00:00'),
  },
  {
    id: '6',
    postId: '4',
    author: mockUsers[1],
    content: "I'm interested! When were you thinking of meeting?",
    likes: 3,
    isLiked: false,
    createdAt: new Date('2024-01-30T19:35:00'),
  },
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Computer Science Level 100',
    description: 'A study group for first-year CS students. Share notes, discuss assignments, and prepare for exams together.',
    avatar: '/api/placeholder/60/60',
    members: 234,
    isJoined: true,
    isPrivate: false,
    university: 'Tech University',
    category: 'Academic',
    createdAt: new Date('2023-09-15')
  },
  {
    id: '2',
    name: 'Business Club',
    description: 'Connect with fellow business students, attend networking events, and discuss entrepreneurship opportunities.',
    avatar: '/api/placeholder/60/60',
    members: 156,
    isJoined: false,
    isPrivate: false,
    university: 'Tech University',
    category: 'Professional',
    createdAt: new Date('2023-08-20')
  },
  {
    id: '3',
    name: 'Basketball Team',
    description: 'Official university basketball team. Practice schedules, game updates, and team bonding activities.',
    avatar: '/api/placeholder/60/60',
    members: 89,
    isJoined: true,
    isPrivate: false,
    university: 'Tech University',
    category: 'Sports',
    createdAt: new Date('2023-07-10')
  },
  {
    id: '4',
    name: 'Photography Society',
    description: 'Capture campus life, share photography tips, and organize photo walks around the university.',
    avatar: '/api/placeholder/60/60',
    members: 78,
    isJoined: false,
    isPrivate: false,
    university: 'Tech University',
    category: 'Arts',
    createdAt: new Date('2023-09-01')
  }
];

export const mockTutors: TutorProfile[] = [
  {
    id: '1',
    user: {
      ...mockUsers[0],
      displayName: 'Sarah Chen',
      major: 'Computer Science',
      year: 3
    },
    subjects: ['DCIT 101', 'DCIT 201', 'Mathematics', 'Programming'],
    hourlyRate: 15,
    rating: 4.8,
    reviewCount: 24,
    availability: [
      { day: 'Monday', startTime: '14:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '10:00', endTime: '12:00' },
      { day: 'Friday', startTime: '13:00', endTime: '16:00' }
    ],
    description: 'Experienced CS student with strong background in programming and mathematics. Specializing in introductory computer science courses.',
    verified: true
  },
  {
    id: '2',
    user: {
      ...mockUsers[1],
      displayName: 'David Wilson',
      major: 'Mathematics',
      year: 4
    },
    subjects: ['Calculus I', 'Calculus II', 'Statistics', 'Linear Algebra'],
    hourlyRate: 20,
    rating: 4.9,
    reviewCount: 31,
    availability: [
      { day: 'Tuesday', startTime: '15:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '12:00' }
    ],
    description: 'Senior mathematics major with passion for teaching. Helped over 50 students improve their math grades.',
    verified: true
  }
];

export const mockMentors: MentorProfile[] = [
  {
    id: '1',
    user: {
      ...mockUsers[2],
      displayName: 'Dr. Emily Davis',
      major: 'Psychology'
    },
    industry: 'Technology',
    company: 'Google',
    position: 'Senior Software Engineer',
    experience: 5,
    specialties: ['Career Development', 'Tech Industry', 'Leadership', 'Work-Life Balance'],
    rating: 4.7,
    reviewCount: 18,
    availability: [
      { day: 'Saturday', startTime: '10:00', endTime: '12:00' }
    ],
    description: 'Former Tech University graduate now working at Google. Happy to mentor students interested in tech careers.',
    verified: true
  },
  {
    id: '2',
    user: {
      id: '4',
      username: 'alex_mentor',
      displayName: 'Alex Thompson',
      email: 'alex@alumni.edu',
      bio: 'Business graduate • Startup founder • Mentor',
      verified: true,
      followers: 567,
      following: 234,
      university: 'Tech University',
      major: 'Business Administration',
      createdAt: new Date('2022-05-15')
    },
    industry: 'Entrepreneurship',
    company: 'TechStart Inc.',
    position: 'Founder & CEO',
    experience: 3,
    specialties: ['Entrepreneurship', 'Business Strategy', 'Fundraising', 'Networking'],
    rating: 4.6,
    reviewCount: 12,
    availability: [
      { day: 'Sunday', startTime: '14:00', endTime: '16:00' }
    ],
    description: 'Young entrepreneur who started a successful tech company. Passionate about helping students with business ideas.',
    verified: true
  }
];

export const mockTutoringRequests: TutoringRequest[] = [
  {
    id: '1',
    subject: 'DCIT 101',
    description: 'Need help with basic programming concepts and assignments',
    studentId: '1',
    tutorId: '1',
    status: 'accepted',
    createdAt: new Date('2024-01-28')
  }
];

export const mockUserProfile: UserProfile = {
  ...mockUsers[0],
  posts: [mockPosts[0], mockPosts[3]],
  joinedGroups: [mockGroups[0], mockGroups[2]],
  tutoringRequests: mockTutoringRequests,
  mentorStatus: undefined
};
