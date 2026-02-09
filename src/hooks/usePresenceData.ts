import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getUserPresence,
  checkUserOnline,
  getBulkPresence,
  getConversationOnlineUsers,
  PresenceInfo,
} from '@/api/presence.api';

export const presenceKeys = {
  all: ['presence'] as const,
  user: (userId: string) => [...presenceKeys.all, 'user', userId] as const,
  userOnline: (userId: string) => [...presenceKeys.all, 'online', userId] as const,
  bulk: (userIds: string[]) => [...presenceKeys.all, 'bulk', ...userIds.sort()] as const,
  conversationOnline: (conversationId: string) =>
    [...presenceKeys.all, 'conversation', conversationId] as const,
};


export const useUserPresence = (
  userId: string | null | undefined,
  options?: { enabled?: boolean }
): UseQueryResult<PresenceInfo, Error> => {
  return useQuery({
    queryKey: presenceKeys.user(userId || ''),
    queryFn: () => getUserPresence(userId!),
    enabled: !!userId && options?.enabled !== false,
    staleTime: 30000,
    refetchInterval: 30000, 
  });
};

export const useUserOnline = (
  userId: string | null | undefined,
  options?: { enabled?: boolean }
): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: presenceKeys.userOnline(userId || ''),
    queryFn: () => checkUserOnline(userId!),
    enabled: !!userId && options?.enabled !== false,
    staleTime: 15000,
    refetchInterval: 15000, 
  });
};


export const useBulkPresence = (
  userIds: string[],
  options?: { enabled?: boolean }
): UseQueryResult<Record<string, PresenceInfo>, Error> => {
  return useQuery({
    queryKey: presenceKeys.bulk(userIds),
    queryFn: () => getBulkPresence(userIds),
    enabled: userIds.length > 0 && options?.enabled !== false,
    staleTime: 30000, 
    refetchInterval: 30000,
  });
};


export const useConversationOnlineUsers = (
  conversationId: string | null | undefined,
  options?: { enabled?: boolean }
): UseQueryResult<PresenceInfo[], Error> => {
  return useQuery({
    queryKey: presenceKeys.conversationOnline(conversationId || ''),
    queryFn: () => getConversationOnlineUsers(conversationId!),
    enabled: !!conversationId && options?.enabled !== false,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};
