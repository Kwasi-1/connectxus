import { StoryData, Community, Group } from "@/types/storyTypes";

const NEW_STORAGE_KEY = "campus_stories_v2";
const AUDIENCE_SELECTION_KEY = "story_audience_selection";

export const getStoriesFromStorage = (): StoryData[] => {
  try {
    const stored = localStorage.getItem(NEW_STORAGE_KEY);
    if (!stored) return [];

    const stories: StoryData[] = JSON.parse(stored);
    
    const now = new Date().getTime();
    const validStories = stories.filter(
      (story) => new Date(story.expiresAt).getTime() > now
    );

    if (validStories.length !== stories.length) {
      localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(validStories));
    }

    return validStories;
  } catch (error) {
    console.error("Error reading stories from localStorage:", error);
    return [];
  }
};

export const saveStoryToStorage = (story: StoryData): void => {
  try {
    const stories = getStoriesFromStorage();
    stories.unshift(story); 
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(stories));
  } catch (error) {
    console.error("Error saving story to localStorage:", error);
    throw error;
  }
};

export const deleteStoryFromStorage = (storyId: string): void => {
  try {
    const stories = getStoriesFromStorage();
    const updatedStories = stories.filter((s) => s.id !== storyId);
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(updatedStories));
  } catch (error) {
    console.error("Error deleting story from localStorage:", error);
    throw error;
  }
};

export const getSavedAudienceSelection = (): {
  type: "community" | "group" | "following";
  ids: string[];
} => {
  try {
    const stored = localStorage.getItem(AUDIENCE_SELECTION_KEY);
    if (!stored) {
      return { type: "following", ids: [] };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading audience selection:", error);
    return { type: "following", ids: [] };
  }
};

export const saveAudienceSelection = (
  type: "community" | "group" | "following",
  ids: string[]
): void => {
  try {
    localStorage.setItem(
      AUDIENCE_SELECTION_KEY,
      JSON.stringify({ type, ids })
    );
  } catch (error) {
    console.error("Error saving audience selection:", error);
  }
};

export const mockCommunities: Community[] = [
  {
    id: "comm1",
    name: "Computer Science Students",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=cs",
    memberCount: 1234,
  },
  {
    id: "comm2",
    name: "Campus Events",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=events",
    memberCount: 567,
  },
  {
    id: "comm3",
    name: "Study Groups",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=study",
    memberCount: 890,
  },
  {
    id: "comm4",
    name: "Sports & Recreation",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=sports",
    memberCount: 445,
  },
  {
    id: "comm5",
    name: "Arts & Culture",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=arts",
    memberCount: 332,
  },
];

export const mockGroups: Group[] = [
  {
    id: "grp1",
    name: "Web Development Team",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=webdev",
    memberCount: 45,
  },
  {
    id: "grp2",
    name: "Photography Club",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=photo",
    memberCount: 78,
  },
  {
    id: "grp3",
    name: "Math Tutoring",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=math",
    memberCount: 23,
  },
  {
    id: "grp4",
    name: "Gaming Squad",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=gaming",
    memberCount: 156,
  },
  {
    id: "grp5",
    name: "Debate Society",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=debate",
    memberCount: 34,
  },
];
