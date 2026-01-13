import { useRef } from "react";
import { StoryCircle } from "./StoryCircle";
import { StoryGroup } from "@/types/story";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface StoriesListProps {
  stories: StoryGroup[];
  onStoryClick: (storyGroup: StoryGroup, index: number) => void;
  onAddStory?: () => void;
}

export const StoriesList = ({
  stories,
  onStoryClick,
  onAddStory,
}: StoriesListProps) => {
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

  return (
    <div className="relative border-b border-border bg-background">
      <div className="relative group">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
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
          {stories.map((storyGroup, index) => (
            <StoryCircle
              key={storyGroup.user_id}
              username={storyGroup.username}
              avatar={storyGroup.avatar}
              hasUnseen={storyGroup.has_unseen}
              onClick={() => onStoryClick(storyGroup, index)}
            />
          ))}
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
