import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Story, StoryGroup } from "@/types/story";
import { getTimeAgo } from "@/data/mockStories";
import { cn } from "@/lib/utils";

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
}

export const StoryViewer = ({
  isOpen,
  onClose,
  storyGroups,
  initialGroupIndex,
}: StoryViewerProps) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const totalStories = currentGroup?.stories.length || 0;

  // Auto-advance story
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentGroupIndex, currentStoryIndex, isPaused]);

  const handleNext = useCallback(() => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [
    currentStoryIndex,
    totalStories,
    currentGroupIndex,
    storyGroups.length,
    onClose,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prev) => prev - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  }, [currentStoryIndex, currentGroupIndex, storyGroups]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "Escape") onClose();
    },
    [isOpen, handleNext, handlePrevious, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setCurrentGroupIndex(initialGroupIndex);
    setCurrentStoryIndex(0);
    setProgress(0);
  }, [initialGroupIndex]);

  if (!isOpen || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Story container */}
      <div className="relative w-full max-w-md h-full md:h-[90vh] bg-black">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {currentGroup.stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width:
                    index < currentStoryIndex
                      ? "100%"
                      : index === currentStoryIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 mt-3">
          <div className="flex items-center gap-2">
            <Avatar className="w-10 h-10 ring-2 ring-white">
              <AvatarImage
                src={currentGroup.avatar}
                alt={currentGroup.username}
              />
              <AvatarFallback>
                {currentGroup.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="font-semibold text-sm">@{currentGroup.username}</p>
              <p className="text-xs text-white/80">
                {getTimeAgo(currentStory.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => {
                // Share functionality
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Story content */}
        <div
          className="relative w-full h-full bg-black flex items-center justify-center"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />

          {/* Navigation areas */}
          <button
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
            onClick={handlePrevious}
            aria-label="Previous story"
          />
          <button
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
            onClick={handleNext}
            aria-label="Next story"
          />
        </div>

        {/* Reply input */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <Input
              placeholder={`Reply to @${currentGroup.username}...`}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50"
            />
            <Button
              size="icon"
              className="bg-transparent hover:bg-white/20 text-white text-xl"
            >
              ❤️
            </Button>
            <Button
              size="icon"
              className="bg-transparent hover:bg-white/20 text-white text-xl"
            >
              😂
            </Button>
            <Button
              size="icon"
              className="bg-transparent hover:bg-white/20 text-white text-xl"
            >
              👍
            </Button>
          </div>
        </div>

        {/* Desktop navigation arrows */}
        <button
          onClick={handlePrevious}
          className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
          disabled={currentGroupIndex === 0 && currentStoryIndex === 0}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};
