import { useRef } from "react";
import { StoryCircle } from "./StoryCircle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { GroupedStories } from "@/api/stories.api";

interface NewStoriesListProps {
  groupedStories: GroupedStories[];
  onStoryClick: (userStories: GroupedStories, storyIndex: number) => void;
  onAddStory?: () => void;
  isLoading?: boolean;
}

export const NewStoriesList = ({
  groupedStories,
  onStoryClick,
  onAddStory,
  isLoading,
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

  if (isLoading) {
    return (
      <div className="border-b border-border bg-background">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
              <div className="w-12 h-3 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative border-b border-border bg-background">
      <div className="relative group">
        {groupedStories.length > 5 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <StoryCircle
            username="Add Story"
            avatar=""
            isAddStory
            onClick={onAddStory}
          />

          {groupedStories.map((userStories) => (
            <StoryCircle
              key={userStories.user_id}
              username={userStories.username}
              avatar={userStories.user_avatar || ""}
              hasUnseen={userStories.has_unseen}
              onClick={() => onStoryClick(userStories, 0)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
