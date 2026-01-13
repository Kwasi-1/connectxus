import { Story, StoryGroup } from '@/types/story';

const STORAGE_KEY = 'user_stories';

// Save user stories to localStorage
export const saveUserStories = (stories: Story[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  } catch (error) {
    console.error('Error saving stories to localStorage:', error);
  }
};

// Get user stories from localStorage
export const getUserStories = (): Story[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const stories: Story[] = JSON.parse(stored);
    
    // Filter out expired stories
    const now = new Date();
    return stories.filter(story => new Date(story.expires_at) > now);
  } catch (error) {
    console.error('Error loading stories from localStorage:', error);
    return [];
  }
};

// Add a new story
export const addUserStory = (
  userId: string,
  username: string,
  avatar: string,
  mediaUrl: string,
  mediaType: 'image' | 'video'
): Story => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const newStory: Story = {
    id: `story_${Date.now()}`,
    user_id: userId,
    username,
    avatar,
    media_url: mediaUrl,
    media_type: mediaType,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  const existingStories = getUserStories();
  const updatedStories = [newStory, ...existingStories];
  saveUserStories(updatedStories);

  return newStory;
};

// Delete a story
export const deleteUserStory = (storyId: string) => {
  const existingStories = getUserStories();
  const updatedStories = existingStories.filter(story => story.id !== storyId);
  saveUserStories(updatedStories);
};

// Clear all expired stories
export const clearExpiredStories = () => {
  const validStories = getUserStories();
  saveUserStories(validStories);
};

// Get user's story group
export const getUserStoryGroup = (
  userId: string,
  username: string,
  avatar: string
): StoryGroup | null => {
  const stories = getUserStories().filter(story => story.user_id === userId);
  
  if (stories.length === 0) return null;

  return {
    user_id: userId,
    username,
    avatar,
    stories,
    has_unseen: false,
  };
};
