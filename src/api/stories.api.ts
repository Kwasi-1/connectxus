import apiClient from "@/lib/apiClient";
import { StoryData, AudienceType } from "@/types/storyTypes";

interface ApiResponse<T> {
  data: T;
}

export interface Story {
  id: string;
  user_id: string;
  space_id: string;
  story_type: "text" | "image" | "video";
  content?: string | null;
  media_url?: string | null;
  background_color?: string | null;
  background_gradient?: string | null;
  filter_name?: string | null;
  filter_css?: string | null;
  caption?: string | null;
  visibility: string;
  status: string;
  created_at: string;
  expires_at: string;
  username?: string;
  full_name?: string;
  user_avatar?: string | null;
  user_verified?: boolean;
  views_count?: number;
  has_viewed?: boolean;
  audience?: StoryAudience[];
}

export interface StoryAudience {
  id: string;
  story_id: string;
  audience_type: "following" | "community" | "group";
  community_id?: string | null;
  group_id?: string | null;
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
  username?: string;
  full_name?: string;
  avatar?: string | null;
  user_verified?: boolean;
}

export interface GroupedStories {
  user_id: string;
  username: string;
  full_name: string;
  user_avatar?: string | null;
  user_verified: boolean;
  stories: Story[];
  has_unseen: boolean;
}

export interface CreateStoryRequest {
  story_type: "text" | "image" | "video";
  content?: string;
  media_url?: string;
  background_color?: string;
  background_gradient?: string;
  filter_name?: string;
  filter_css?: string;
  caption?: string;
  visibility?: string;
  audience_type: "following" | "community" | "group";
  community_ids?: string[];
  group_ids?: string[];
}

const transformStory = (apiStory: any): Story => {
  return {
    id: apiStory.id,
    user_id: apiStory.user_id,
    space_id: apiStory.space_id,
    story_type: apiStory.story_type,
    content: apiStory.content,
    media_url: apiStory.media_url,
    background_color: apiStory.background_color,
    background_gradient: apiStory.background_gradient,
    filter_name: apiStory.filter_name,
    filter_css: apiStory.filter_css,
    caption: apiStory.caption,
    visibility: apiStory.visibility,
    status: apiStory.status,
    created_at: apiStory.created_at,
    expires_at: apiStory.expires_at,
    username: apiStory.username,
    full_name: apiStory.full_name,
    user_avatar: apiStory.user_avatar,
    user_verified: apiStory.user_verified,
    views_count: apiStory.views_count,
    has_viewed: apiStory.has_viewed,
    audience: apiStory.audience,
  };
};

const transformStories = (stories: any[]): Story[] => {
  return stories.map(transformStory);
};

export const storiesApi = {
  createStory: async (data: CreateStoryRequest): Promise<Story> => {
    const response = await apiClient.post<ApiResponse<Story>>("/stories", data);
    return transformStory(response.data.data);
  },

  getStory: async (storyId: string): Promise<Story> => {
    const response = await apiClient.get<ApiResponse<Story>>(`/stories/${storyId}`);
    return transformStory(response.data.data);
  },

  getUserStories: async (username: string): Promise<Story[]> => {
    const response = await apiClient.get<ApiResponse<Story[]>>(`/stories/user/${username}`);
    return transformStories(response.data.data);
  },

  getActiveStories: async (): Promise<Story[]> => {
    const response = await apiClient.get<ApiResponse<Story[]>>("/stories/active");
    return transformStories(response.data.data);
  },

  getGroupedStories: async (): Promise<GroupedStories[]> => {
    const response = await apiClient.get<ApiResponse<GroupedStories[]>>("/stories/grouped");
    return response.data.data;
  },

  getFollowingStories: async (): Promise<Story[]> => {
    const response = await apiClient.get<ApiResponse<Story[]>>("/stories/following");
    return transformStories(response.data.data);
  },

  getCommunityStories: async (communityId: string): Promise<Story[]> => {
    const response = await apiClient.get<ApiResponse<Story[]>>(`/stories/community/${communityId}`);
    return transformStories(response.data.data);
  },

  getGroupStories: async (groupId: string): Promise<Story[]> => {
    const response = await apiClient.get<ApiResponse<Story[]>>(`/stories/group/${groupId}`);
    return transformStories(response.data.data);
  },

  deleteStory: async (storyId: string): Promise<void> => {
    await apiClient.delete(`/stories/${storyId}`);
  },

  createStoryView: async (storyId: string): Promise<void> => {
    await apiClient.post(`/stories/${storyId}/view`);
  },

  getStoryViews: async (storyId: string, limit: number = 50, offset: number = 0): Promise<StoryView[]> => {
    const response = await apiClient.get<ApiResponse<StoryView[]>>(
      `/stories/${storyId}/views`,
      { params: { limit, offset } }
    );
    return response.data.data;
  },

  getStoryViewsCount: async (storyId: string): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      `/stories/${storyId}/views/count`
    );
    return response.data.data.count;
  },
};
