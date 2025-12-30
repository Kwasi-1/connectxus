import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAvailableHelpRequests,
  getMyHelpRequests,
  toggleHelpRequestVisibility,
  deleteHelpRequest,
} from '@/api/help_requests.api';
import type { HelpRequest } from '@/types/help_requests';
import { toast } from 'sonner';

interface HelpRequestFilters {
  type?: string;
  level?: string;
  levelAndBelow?: boolean;
}

interface UseHelpRequestsOptions {
  tab: 'available' | 'my-requests';
  filters?: HelpRequestFilters;
  enabled?: boolean;
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 20;

export function useHelpRequests(options: UseHelpRequestsOptions) {
  const {
    tab,
    filters = {},
    enabled = true,
    itemsPerPage = ITEMS_PER_PAGE,
  } = options;

  const queryClient = useQueryClient();

  const getQueryKey = () => {
    if (tab === 'available') {
      return ['available-help-requests', filters];
    }
    return ['my-help-requests'];
  };

  const fetchHelpRequests = async ({ pageParam = 0 }: { pageParam?: number }) => {
    const params: any = {
      limit: itemsPerPage,
      offset: pageParam,
    };

    if (tab === 'available') {
      if (filters.type && filters.type !== 'all') {
        params.type = filters.type;
      }

      if (filters.level && filters.level !== 'all') {
        params.filter_level = parseInt(filters.level);
        if (!filters.levelAndBelow) {
          params.level_exact_match = true;
        }
      }
    }

    const requests = tab === 'available'
      ? await getAvailableHelpRequests(params)
      : await getMyHelpRequests(params);

    return {
      requests: requests || [],
      nextOffset: requests && requests.length === itemsPerPage ? pageParam + itemsPerPage : undefined,
      hasMore: requests && requests.length === itemsPerPage,
    };
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: getQueryKey(),
    queryFn: fetchHelpRequests,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    enabled,
  });

  const requests = data?.pages.flatMap((page) => page.requests) || [];

  const toggleVisibilityMutation = useMutation({
    mutationFn: toggleHelpRequestVisibility,
    onSuccess: (updated) => {
      queryClient.setQueryData(['help-request', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['available-help-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-help-requests'] });
      toast.success(`Help request is now ${updated.status === 'public' ? 'public' : 'private'}`);
    },
    onError: () => {
      toast.error('Failed to update visibility');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-help-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-help-requests'] });
      toast.success('Help request deleted');
    },
    onError: () => {
      toast.error('Failed to delete help request');
    },
  });

  return {
    requests,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage || false,
    fetchNextPage,
    refetch,
    toggleVisibility: (id: string) => toggleVisibilityMutation.mutate(id),
    deleteRequest: (id: string) => deleteMutation.mutate(id),
  };
}
