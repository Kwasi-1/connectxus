import apiClient, { ApiResponse } from "@/lib/apiClient";

export interface SearchFilters {
  query: string;
  space_id?: string;
  page?: number;
  limit?: number;
}

export interface UserSearchResult {
  id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  level?: string | null;
  department?: string | null;
  verified: boolean;
  follower_count?: number;
  following_count?: number;
}

export interface PostSearchResult {
  id: string;
  content: string;
  author_id: string;
  username?: string | null;
  full_name?: string | null;
  author_avatar?: string | null;
  images?: string[];
  video_url?: string | null;
  likes_count: number;
  comments_count: number;
  shares_count?: number;
  reposts_count?: number;
  created_at: string;
  community_id?: string | null;
  group_id?: string | null;
}

export interface CommunitySearchResult {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
  category: string;
  member_count: number;
  is_public: boolean;
  is_joined?: boolean;
}

export interface GroupSearchResult {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  banner?: string | null;
  category: string;
  group_type: string;
  member_count: number;
  is_member?: boolean;
  user_role?: string | null;
}

export interface EventSearchResult {
  id: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  event_type: string;
  location: string;
  start_time: string;
  end_time?: string | null;
  max_attendees?: number | null;
  attendee_count: number;
  is_attending?: boolean;
}

export interface TutorSearchResult {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  subjects: string[];
  hourly_rate?: number | null;
  rating: number;
  total_sessions: number;
}

export interface GlobalSearchResults {
  users: UserSearchResult[];
  posts: PostSearchResult[];
  events: EventSearchResult[];
}

export const searchUsers = async (
  filters: SearchFilters
): Promise<UserSearchResult[]> => {
  const response = await apiClient.get<ApiResponse<UserSearchResult[]>>(
    "/users/search",
    {
      params: {
        q: filters.query,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    }
  );
  return response.data.data;
};

export const searchPosts = async (
  filters: SearchFilters
): Promise<PostSearchResult[]> => {
  const response = await apiClient.get<ApiResponse<PostSearchResult[]>>(
    "/posts/search",
    {
      params: {
        q: filters.query,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    }
  );
  return response.data.data;
};

export const searchCommunities = async (
  filters: SearchFilters
): Promise<CommunitySearchResult[]> => {
  const response = await apiClient.get<ApiResponse<CommunitySearchResult[]>>(
    "/communities/search",
    {
      params: {
        q: filters.query,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    }
  );
  return response.data.data;
};

export const searchGroups = async (
  filters: SearchFilters
): Promise<GroupSearchResult[]> => {
  const response = await apiClient.get<ApiResponse<GroupSearchResult[]>>(
    "/groups/search",
    {
      params: {
        q: filters.query,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    }
  );
  return response.data.data;
};

export const searchEvents = async (
  filters: SearchFilters
): Promise<EventSearchResult[]> => {
  const response = await apiClient.get<ApiResponse<EventSearchResult[]>>(
    "/events/search",
    {
      params: {
        q: filters.query,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    }
  );
  return response.data.data;
};

export const searchTutors = async (
  filters: SearchFilters
): Promise<TutorSearchResult[]> => {
  const response = await apiClient.get<ApiResponse<TutorSearchResult[]>>(
    "/tutors/search",
    {
      params: {
        q: filters.query,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    }
  );
  return response.data.data;
};

export const globalSearch = async (
  filters: SearchFilters
): Promise<GlobalSearchResults> => {
  const [users, posts, events] = await Promise.allSettled([
    searchUsers({ ...filters, limit: 5 }),
    searchPosts({ ...filters, limit: 5 }),
    searchEvents({ ...filters, limit: 5 }),
  ]);

  return {
    users: users.status === "fulfilled" ? users.value : [],
    posts: posts.status === "fulfilled" ? posts.value : [],
    events: events.status === "fulfilled" ? events.value : [],
  };
};

export const searchApi = {
  searchUsers,
  searchPosts,
  searchCommunities,
  searchGroups,
  searchEvents,
  searchTutors,
  globalSearch,
};

export default searchApi;
