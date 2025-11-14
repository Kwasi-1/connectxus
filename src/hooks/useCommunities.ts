
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  searchCommunities,
  getCommunityMembers,
  getUserCommunities,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  PaginationParams,
} from '@/api/communities.api';
import { toast } from 'sonner';

export const communityKeys = {
  all: ['communities'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (filters: any) => [...communityKeys.lists(), filters] as const,
  details: () => [...communityKeys.all, 'detail'] as const,
  detail: (id: string) => [...communityKeys.details(), id] as const,
  members: (id: string, params?: PaginationParams) => [...communityKeys.all, 'members', id, params] as const,
  userCommunities: () => [...communityKeys.all, 'user'] as const,
  search: (query: string, params?: PaginationParams) => [...communityKeys.all, 'search', query, params] as const,
};

export const useCommunities = (params?: PaginationParams) => {
  return useQuery({
    queryKey: communityKeys.list(params),
    queryFn: () => getCommunities(params),
  });
};

export const useCommunity = (communityId: string) => {
  return useQuery({
    queryKey: communityKeys.detail(communityId),
    queryFn: () => getCommunityById(communityId),
    enabled: !!communityId,
  });
};

export const useSearchCommunities = (query: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: communityKeys.search(query, params),
    queryFn: () => searchCommunities(query, params),
    enabled: !!query && query.length > 0,
  });
};

export const useCommunityMembers = (communityId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: communityKeys.members(communityId, params),
    queryFn: () => getCommunityMembers(communityId, params),
    enabled: !!communityId,
  });
};

export const useUserCommunities = () => {
  return useQuery({
    queryKey: communityKeys.userCommunities(),
    queryFn: () => getUserCommunities(),
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommunityRequest) => createCommunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
      toast.success('Community created successfully!');
    },
    onError: () => {
      toast.error('Failed to create community');
    },
  });
};

export const useUpdateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, data }: { communityId: string; data: UpdateCommunityRequest }) =>
      updateCommunity(communityId, data),
    onSuccess: (_, { communityId }) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
      toast.success('Community updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update community');
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (communityId: string) => joinCommunity(communityId),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.userCommunities() });
      toast.success('Joined community successfully!');
    },
    onError: () => {
      toast.error('Failed to join community');
    },
  });
};

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (communityId: string) => leaveCommunity(communityId),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.userCommunities() });
      toast.success('Left community successfully!');
    },
    onError: () => {
      toast.error('Failed to leave community');
    },
  });
};
