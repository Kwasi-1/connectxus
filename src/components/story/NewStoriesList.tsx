import { useRef } from "react";
import { StoryCircle } from "./StoryCircle";
import { StoryData } from "@/types/storyTypes";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NewStoriesListProps {
  stories: StoryData[];
  onStoryClick: (story: StoryData, index: number) => void;
  onAddStory?: () => void;
}

export const NewStoriesList = ({
  stories,
  onStoryClick,
  onAddStory,
}: NewStoriesListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Group stories by user
  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = {
        userId: story.userId,
        username: story.username,
        avatar: story.userAvatar,
        stories: [],
      };
    }
    acc[story.userId].stories.push(story);
    return acc;
  }, {} as Record<string, { userId: string; username: string; avatar?: string; stories: StoryData[] }>);

  const userGroups = Object.values(groupedStories);

  return (
    <div className="relative border-b border-border bg-background">
      <div className="relative group">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-transparent backdrop-blur-sm hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Stories container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Add Story button */}
          <StoryCircle
            username="Add Story"
            avatar=""
            isAddStory
            onClick={onAddStory}
          />

          {/* User stories */}
          {userGroups.map((group) => {
            const firstStoryIndex = stories.findIndex(
              (s) => s.userId === group.userId
            );
            return (
              <StoryCircle
                key={group.userId}
                username={group.username}
                avatar={group.avatar || ""}
                hasUnseen={group.userId !== user?.id} // Mark as unseen if not current user
                onClick={() => {
                  const story = group.stories[0];
                  onStoryClick(story, firstStoryIndex);
                }}
              />
            );
          })}
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-transparent backdrop-blur-sm hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
