import { User, Post, TrendingTopic, CampusHighlight, Comment } from '@/types/global';

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
