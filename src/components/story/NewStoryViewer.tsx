import { useEffect, useState, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoryData } from "@/types/storyTypes";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface NewStoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryData[];
  initialStoryIndex: number;
}

export const NewStoryViewer = ({
  isOpen,
  onClose,
  stories,
  initialStoryIndex,
}: NewStoryViewerProps) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const currentStory = stories[currentStoryIndex];
  const totalStories = stories.length;

  // Auto-advance story
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50;
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
  }, [isOpen, currentStoryIndex, isPaused]);

  const handleNext = useCallback(() => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentStoryIndex, totalStories, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentStoryIndex]);

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
    setCurrentStoryIndex(initialStoryIndex);
    setProgress(0);
  }, [initialStoryIndex]);

  if (!isOpen || !currentStory) return null;

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-md flex items-center justify-center">
      <div className="relative w-full max-w-md h-full md:h-[90vh] bg-gradient-to-br from-black via-gray-900 to-black md:rounded-2xl overflow-hidden shadow-2xl">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1.5 p-3">
          {stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-white transition-all duration-100"
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
        <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 mt-3 bg-transparent pb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 ring-2 ring-primary/60 shadow-lg">
              <AvatarImage
                src={currentStory.userAvatar}
                alt={currentStory.username}
              />
              <AvatarFallback className="bg-primary/20">
                {currentStory.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="font-bold text-sm drop-shadow-lg">
                @{currentStory.username}
              </p>
              <p className="text-xs text-white/90 drop-shadow-md">
                {getTimeAgo(currentStory.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 backdrop-blur-md rounded-full"
              onClick={() => {
                // Share functionality
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 backdrop-blur-md rounded-full"
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
          {/* Text Story */}
          {currentStory.type === "text" && (
            <div
              className="w-full h-full flex items-center justify-center p-8"
              style={{
                background:
                  currentStory.backgroundColor || currentStory.gradient,
              }}
            >
              <p
                className="text-white text-4xl md:text-5xl font-bold text-center leading-tight break-words max-w-md"
                style={{
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                }}
              >
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Image Story */}
          {currentStory.type === "image" && currentStory.mediaUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentStory.mediaUrl}
                alt="Story"
                className={cn(
                  "max-w-full max-h-full object-contain",
                  currentStory.filter?.cssClass
                )}
              />
              {currentStory.caption && (
                <div className="absolute bottom-24 left-0 right-0 px-6">
                  <p className="text-white text-xl font-semibold text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] bg-black/30 backdrop-blur-sm px-4 py-3 rounded-lg">
                    {currentStory.caption}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video Story */}
          {currentStory.type === "video" && currentStory.mediaUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={currentStory.mediaUrl}
                className={cn(
                  "max-w-full max-h-full object-contain",
                  currentStory.filter?.cssClass
                )}
                autoPlay
                loop
                muted={isMuted}
                playsInline
              />
              {currentStory.caption && (
                <div className="absolute bottom-24 left-0 right-0 px-6">
                  <p className="text-white text-xl font-semibold text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] bg-black/30 backdrop-blur-sm px-4 py-3 rounded-lg">
                    {currentStory.caption}
                  </p>
                </div>
              )}
              {/* Mute/Unmute Button for Video */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-24 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-white/20 z-20"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}

          {/* Navigation areas */}
          <button
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
            onClick={handlePrevious}
            aria-label="Previous story"
            title="Previous story"
          />
          <button
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
            onClick={handleNext}
            aria-label="Next story"
            title="Next story"
          />
        </div>

        {/* Reply input */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-8">
          <div className="flex items-center gap-2">
            <Input
              placeholder={`Reply to @${currentStory.username}...`}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary/50 backdrop-blur-md rounded-full"
            />
            <Button
              size="icon"
              className="bg-transparent hover:bg-white/10 text-white text-2xl backdrop-blur-md"
            >
              ❤️
            </Button>
            <Button
              size="icon"
              className="bg-transparent hover:bg-white/10 text-white text-2xl backdrop-blur-md"
            >
              😂
            </Button>
            <Button
              size="icon"
              className="bg-transparent hover:bg-white/10 text-white text-2xl backdrop-blur-md"
            >
              👍
            </Button>
          </div>
        </div>

        {/* Desktop navigation arrows */}
        <button
          onClick={handlePrevious}
          className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all hover:scale-110 disabled:opacity-50 border border-white/20"
          disabled={currentStoryIndex === 0}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all hover:scale-110 border border-white/20"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};
