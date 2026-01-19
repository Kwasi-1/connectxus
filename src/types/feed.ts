
export interface FeedAuthor {
  id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  verified?: boolean;
}

export interface FeedPost {
  id: string;
  space_id: string;
  author_id: string;
  community_id?: string | null;
  group_id?: string | null;
  parent_post_id?: string | null;
  quoted_post_id?: string | null;
  content: string;
  media?: string[] | null;
  tags?: string[] | null;
  visibility?: string | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  quotes_count?: number;
  is_pinned: boolean;
  created_at: string;
  updated_at?: string | null;
  username?: string;
  full_name?: string;
  author_avatar?: string | null;
  author_verified?: boolean | null;
  is_liked?: boolean;
  is_reposted?: boolean;
  quoted_post?: FeedPost | null;
  quoted_username?: string;
  quoted_full_name?: string;
  quoted_content?: string;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at?: string | null;
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar?: string | null;
    verified?: boolean;
  } | null;
  is_liked?: boolean;
  replies?: FeedComment[];
}

export interface FeedFilters {
  tab?: 'following' | 'university';
  userId?: string;
  communityId?: string;
  groupId?: string;
  liked?: boolean;
}

export interface FeedPaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FeedResponse {
  posts: FeedPost[];
  total?: number;
  hasMore?: boolean;
}

export type FeedTab = 'following' | 'university';
export type FeedType = 'home' | 'user' | 'community' | 'group' | 'liked' | 'trending';
