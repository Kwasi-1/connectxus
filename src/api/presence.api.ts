import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/api.types';

export interface PresenceInfo {
  user_id: string;
  is_online: boolean;
  active_conversation_id?: string | null;
  last_seen_at?: string | null;
  last_activity_at?: string | null;
  connection_count: number;
  device_info?: Record<string, any>;
}

export interface BulkPresenceResponse {
  presences: Record<string, PresenceInfo>;
}


export const getUserPresence = async (userId: string): Promise<PresenceInfo> => {
  const response = await apiClient.get<ApiResponse<PresenceInfo>>(
    `/presence/${userId}`
  );
  return response.data.data;
};


export const checkUserOnline = async (userId: string): Promise<boolean> => {
  const response = await apiClient.get<ApiResponse<{ user_id: string; is_online: boolean }>>(
    `/presence/${userId}/online`
  );
  return response.data.data.is_online;
};


export const getBulkPresence = async (
  userIds: string[]
): Promise<Record<string, PresenceInfo>> => {
  if (userIds.length === 0) {
    return {};
  }

  if (userIds.length > 100) {
    throw new Error('Cannot query more than 100 users at once');
  }

  const response = await apiClient.post<ApiResponse<BulkPresenceResponse>>(
    '/presence/bulk',
    { user_ids: userIds }
  );
  return response.data.data.presences;
};


export const getConversationOnlineUsers = async (
  conversationId: string
): Promise<PresenceInfo[]> => {
  const response = await apiClient.get<
    ApiResponse<{ conversation_id: string; online_users: PresenceInfo[]; count: number }>
  >(`/presence/conversation/${conversationId}/online`);
  return response.data.data.online_users;
};
