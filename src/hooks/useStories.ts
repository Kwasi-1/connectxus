import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storiesApi, CreateStoryRequest } from "@/api/stories.api";
import { toast } from "sonner";

interface UseStoriesOptions {
  enabled?: boolean;
}

export const useStories = (options: UseStoriesOptions = {}) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const {  data: groupedStories, isLoading } = useQuery({
    queryKey: ["stories", "grouped"],
    queryFn: () => storiesApi.getGroupedStories(),
    enabled, // Block query if not enabled
  });

  const createStoryMutation = useMutation({
    mutationFn: (data: CreateStoryRequest) => storiesApi.createStory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story posted successfully!");
    },
    onError: (error) => {
      console.error("Error creating story:", error);
      toast.error("Failed to post story");
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (storyId: string) => storiesApi.deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story deleted");
    },
    onError: (error) => {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story");
    },
  });

  const createStoryViewMutation = useMutation({
    mutationFn: (storyId: string) => storiesApi.createStoryView(storyId),
  });

  return {
    groupedStories: groupedStories || [],
    isLoading,
    createStory: createStoryMutation.mutate,
    deleteStory: deleteStoryMutation.mutate,
    createStoryView: createStoryViewMutation.mutate,
    isCreating: createStoryMutation.isPending,
  };
};

export const useStoryViews = (storyId: string) => {
  const { data: views, isLoading } = useQuery({
    queryKey: ["story", storyId, "views"],
    queryFn: () => storiesApi.getStoryViews(storyId),
    enabled: !!storyId,
  });

  const { data: viewsCount } = useQuery({
    queryKey: ["story", storyId, "views", "count"],
    queryFn: () => storiesApi.getStoryViewsCount(storyId),
    enabled: !!storyId,
  });

  return {
    views: views || [],
    viewsCount: viewsCount || 0,
    isLoading,
  };
};
