import { Story, StoryGroup } from '@/types/story';

// Mock story data - will be replaced with real API calls when backend is ready
export const mockStories: StoryGroup[] = [
  {
    user_id: 'user1',
    username: 'Yara S.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yara',
    has_unseen: true,
    stories: [
      {
        id: 'story1',
        user_id: 'user1',
        username: 'Yara S.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yara',
        media_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
        media_type: 'image',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    user_id: 'user2',
    username: 'Mia K.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    has_unseen: true,
    stories: [
      {
        id: 'story2',
        user_id: 'user2',
        username: 'Mia K.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
        media_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
        media_type: 'image',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    user_id: 'user3',
    username: 'David F.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    has_unseen: true,
    stories: [
      {
        id: 'story3',
        user_id: 'user3',
        username: 'David F.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        media_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
        media_type: 'image',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 23.5 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    user_id: 'user4',
    username: 'Ken T.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ken',
    has_unseen: false,
    stories: [
      {
        id: 'story4',
        user_id: 'user4',
        username: 'Ken T.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ken',
        media_url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a',
        media_type: 'image',
        created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    user_id: 'user5',
    username: 'Sarah D.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    has_unseen: true,
    stories: [
      {
        id: 'story5',
        user_id: 'user5',
        username: 'Sarah D.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        media_url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846',
        media_type: 'image',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    user_id: 'user6',
    username: 'Chloe M.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe',
    has_unseen: true,
    stories: [
      {
        id: 'story6',
        user_id: 'user6',
        username: 'Chloe M.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe',
        media_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
        media_type: 'image',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const mockCampusHighlightStories: Story[] = [
  {
    id: 'highlight1',
    user_id: 'campus',
    username: 'Campus Events',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Campus',
    media_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    media_type: 'image',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    category: 'EVENT',
    title: 'Homecoming 2024 Recap',
    description: "Relive the best moments from last night's celebration...",
  },
  {
    id: 'highlight2',
    user_id: 'campus',
    username: 'Academic Affairs',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Academia',
    media_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
    media_type: 'image',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    category: 'ACADEMIA',
    title: 'Late night study session at the main library',
    description: 'Sarah J.',
  },
  {
    id: 'highlight3',
    user_id: 'campus',
    username: 'Sports',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sports',
    media_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
    media_type: 'image',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
    category: 'SPORTS',
    title: '3v3 Basketball Tournament Signups...',
    description: 'Mike P.',
  },
  {
    id: 'highlight4',
    user_id: 'campus',
    username: 'Science Dept',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Science',
    media_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
    media_type: 'image',
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    category: 'SCIENCE',
    title: 'New Chem Lab',
    description: 'State-of-the-art facilities opened today!',
  },
  {
    id: 'highlight5',
    user_id: 'campus',
    username: 'Student Life',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Clubs',
    media_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
    media_type: 'image',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    category: 'CLUBS',
    title: 'Networking Mixerthis Friday',
    description: 'Connect with alumni and industry professionals',
  },
];

// Function to check if story has expired
export const isStoryExpired = (story: Story): boolean => {
  return new Date(story.expires_at) < new Date();
};

// Function to format time ago
export const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};
