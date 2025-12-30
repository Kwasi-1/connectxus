
import apiClient from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface Attachment {
  url: string;
  filename: string;
  size: number;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  mime_type: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments?: Attachment[];
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video';
  reply_to_id?: string | null;
  reactions?: any | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  sender_username?: string;
  sender_full_name?: string;
  sender_avatar?: string | null;
  reply_content?: string | null;
  reply_username?: string | null;
  sender?: {
    username?: string;
    full_name?: string;
    avatar?: string | null;
  };
  reply_to?: Message | null;
}

export interface Conversation {
  id: string;
  space_id: string;
  name?: string | null;
  avatar?: string | null;
  description?: string | null;
  conversation_type: 'direct' | 'group' | 'channel';
  participant_ids?: string[];
  group_id?: string | null;
  settings?: any | null;
  created_at: string;
  updated_at?: string | null;
  user_role?: string | null;
  notifications_enabled?: boolean;
  last_message_content?: string | null;
  last_message_time?: string | null;
  last_sender_username?: string | null;
  last_sender_full_name?: string | null;
  participants?: any[];
  last_message?: Message;
  unread_count?: number;
}

export interface CreateConversationRequest {
  space_id?: string;
  name?: string | null;
  avatar?: string | null;
  description?: string | null;
  conversation_type: 'direct' | 'group' | 'channel';
  participant_ids?: string[];
  group_id?: string | null;
  settings?: any | null;
}

export interface SendMessageRequest {
  content: string;
  file_ids?: string[];
  message_type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  reply_to_id?: string | null;
}

export const getConversations = async (params?: PaginationParams): Promise<Conversation[]> => {
  const response = await apiClient.get<ApiResponse<Conversation[]>>('/conversations', { params });
  return response.data.data;
};

export const getConversationById = async (conversationId: string): Promise<Conversation> => {
  const response = await apiClient.get<ApiResponse<Conversation>>(`/conversations/${conversationId}`);
  return response.data.data;
};

export const createConversation = async (
  data: Omit<CreateConversationRequest, 'space_id'>
): Promise<Conversation> => {
  const response = await apiClient.post<ApiResponse<Conversation>>('/conversations', data);
  return response.data.data;
};

export const getOrCreateDirectConversation = async (userId: string): Promise<{ conversation_id: string }> => {
  const response = await apiClient.post<ApiResponse<{ conversation_id: string }>>('/conversations/direct', {
    recipient_id: userId,
  });
  return response.data.data;
};

export const getOrCreateGroupConversation = async (
  groupId: string,
  groupName: string,
  groupAvatar?: string
): Promise<{ conversation_id: string }> => {
  try {
    const conversations = await getConversations({ page: 1, limit: 100 });
    const existingConversation = conversations.find(
      (c) => c.conversation_type === 'group' && c.group_id === groupId
    );

    if (existingConversation) {
      return { conversation_id: existingConversation.id };
    }

    const newConversation = await createConversation({
      name: groupName,
      avatar: groupAvatar,
      conversation_type: 'group',
      group_id: groupId,
    });

    return { conversation_id: newConversation.id };
  } catch (error) {
    throw error;
  }
};

export const updateConversation = async (
  conversationId: string,
  data: {
    name?: string | null;
    avatar?: string | null;
    description?: string | null;
    settings?: any | null;
  }
): Promise<Conversation> => {
  const response = await apiClient.put<ApiResponse<Conversation>>(
    `/conversations/${conversationId}`,
    data
  );
  return response.data.data;
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/conversations/${conversationId}`);
};

export const leaveConversation = async (conversationId: string): Promise<void> => {
  await apiClient.post(`/conversations/${conversationId}/leave`);
};

export const updateConversationSettings = async (
  conversationId: string,
  settings: any
): Promise<void> => {
  await apiClient.put(`/conversations/${conversationId}/settings`, settings);
};

export const getConversationParticipants = async (conversationId: string): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/conversations/${conversationId}/participants`
  );
  return response.data.data;
};

export const addConversationParticipants = async (
  conversationId: string,
  userIds: string[]
): Promise<void> => {
  await apiClient.post(`/conversations/${conversationId}/participants`, { user_ids: userIds });
};

export const removeConversationParticipant = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/conversations/${conversationId}/participants/${userId}`);
};

export const getConversationMessages = async (
  conversationId: string,
  params?: PaginationParams
): Promise<Message[]> => {
  const response = await apiClient.get<ApiResponse<Message[]>>(
    `/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data.data;
};

export const sendMessage = async (
  conversationId: string,
  data: SendMessageRequest
): Promise<Message> => {
  const response = await apiClient.post<ApiResponse<Message>>(
    `/conversations/${conversationId}/messages`,
    data
  );
  return response.data.data;
};

export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  await apiClient.post(`/conversations/${conversationId}/read`);
};

export const getUnreadCount = async (conversationId: string): Promise<{ unread_count: number }> => {
  const response = await apiClient.get<ApiResponse<{ unread_count: number }>>(
    `/conversations/${conversationId}/unread`
  );
  return response.data.data;
};

export const getMessageById = async (messageId: string): Promise<Message> => {
  const response = await apiClient.get<ApiResponse<Message>>(`/messages/${messageId}`);
  return response.data.data;
};

export const updateMessage = async (
  messageId: string,
  content: string
): Promise<Message> => {
  const response = await apiClient.put<ApiResponse<Message>>(`/messages/${messageId}`, { content });
  return response.data.data;
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  await apiClient.delete(`/messages/${messageId}`);
};

export const addMessageReaction = async (messageId: string, emoji: string): Promise<void> => {
  await apiClient.post(`/messages/${messageId}/reactions`, { emoji });
};

export const removeMessageReaction = async (messageId: string, emoji: string): Promise<void> => {
  await apiClient.delete(`/messages/${messageId}/reactions/${emoji}`);
};

export const sendTypingIndicator = async (conversationId: string): Promise<void> => {
  await apiClient.post(`/conversations/${conversationId}/typing`);
};

export const getMessagesBetweenUsers = async (
  userId: string,
  params?: PaginationParams
): Promise<Message[]> => {
  const response = await apiClient.get<ApiResponse<Message[]>>(
    `/messages/between/${userId}`,
    {
      params
    }
  );
  return response.data.data;
};

export const messagingApi = {
  getConversations,
  getConversationById,
  createConversation,
  getOrCreateDirectConversation,
  updateConversation,
  deleteConversation,
  leaveConversation,
  updateConversationSettings,
  getConversationParticipants,
  addConversationParticipants,
  removeConversationParticipant,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  getMessageById,
  updateMessage,
  deleteMessage,
  addMessageReaction,
  removeMessageReaction,
  sendTypingIndicator,
  getMessagesBetweenUsers,
};

export default messagingApi;
