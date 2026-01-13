export interface Story {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  category?: 'EVENT' | 'ACADEMIA' | 'SCIENCE' | 'SPORTS' | 'CLUBS';
  title?: string;
  description?: string;
}

export interface StoryGroup {
  user_id: string;
  username: string;
  avatar: string;
  stories: Story[];
  has_unseen: boolean;
}
