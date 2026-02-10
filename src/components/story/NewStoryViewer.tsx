import { useEffect, useState, useCallback, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Eye,
  Trash2,
  Loader2,
  Pause,
  Play,
  Send,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { GroupedStories } from "@/api/stories.api";
import { useStories, useStoryViews } from "@/hooks/useStories";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  getOrCreateDirectConversation,
  sendMessage,
} from "@/api/messaging.api";

interface NewStoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  userStories: GroupedStories;
  initialStoryIndex: number;
  allGroupedStories?: GroupedStories[];
  currentUserIndex?: number;
  onUserChange?: (newUserIndex: number) => void;
}

export const NewStoryViewer = ({
  isOpen,
  onClose,
  userStories,
  initialStoryIndex,
  allGroupedStories = [],
  currentUserIndex = 0,
  onUserChange,
}: NewStoryViewerProps) => {
  const { user } = useAuth();
  const { createStoryView, deleteStory } = useStories();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stories = userStories.stories || [];
  const currentStory = stories[currentStoryIndex];
  const totalStories = stories.length;
  const isOwnStory = currentStory?.user_id === user?.id;

  const { views, isLoading: viewsLoading } = useStoryViews(
    showViewersModal ? currentStory?.id : ""
  );

  useEffect(() => {
    if (currentStory?.id && isOpen) {
      createStoryView(currentStory.id);
    }
  }, [currentStory?.id, isOpen]);

  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    setVideoDuration(0);
    setReplyText("");
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [currentStoryIndex]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const getStoryDuration = () => {
    if (currentStory?.story_type === "video" && videoDuration > 0) {
      return Math.min(videoDuration * 1000, 180000);
    }
    return 10000;
  };

  useEffect(() => {
    if (!isOpen || isPaused || isLoading || isTyping) return;

    const duration = getStoryDuration();
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
  }, [isOpen, currentStoryIndex, isPaused, isLoading, videoDuration, isTyping]);

  const handleNext = useCallback(() => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      if (allGroupedStories.length > 0 && currentUserIndex < allGroupedStories.length - 1) {
        const nextUserIndex = currentUserIndex + 1;
        if (onUserChange) {
          onUserChange(nextUserIndex);
          setCurrentStoryIndex(0);
          setProgress(0);
        }
      } else {
        onClose();
      }
    }
  }, [currentStoryIndex, totalStories, allGroupedStories, currentUserIndex, onUserChange, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      if (allGroupedStories.length > 0 && currentUserIndex > 0) {
        const prevUserIndex = currentUserIndex - 1;
        const prevUserStories = allGroupedStories[prevUserIndex];
        if (onUserChange && prevUserStories) {
          onUserChange(prevUserIndex);
          setCurrentStoryIndex(prevUserStories.stories.length - 1);
          setProgress(0);
        }
      }
    }
  }, [currentStoryIndex, allGroupedStories, currentUserIndex, onUserChange]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      deleteStory(currentStory.id);
      toast.success("Story deleted");
      if (totalStories > 1) {
        if (currentStoryIndex < totalStories - 1) {
          handleNext();
        } else if (currentStoryIndex > 0) {
          handlePrevious();
        } else {
          onClose();
        }
      } else {
        onClose();
      }
    } catch (error) {
      toast.error("Failed to delete story");
    }
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReplyText(value);

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const sendStoryMessage = async (content: string, isReaction = false) => {
    try {
      const recipientId = currentStory.user_id;
      const { conversation_id } = await getOrCreateDirectConversation(recipientId);

      const storyMetadata = {
        story_id: currentStory.id,
        story_type: currentStory.story_type,
        story_media_url: currentStory.media_url,
        story_background: currentStory.background_gradient || currentStory.background_color,
        story_content: currentStory.content,
        is_reaction: isReaction,
        message: content,
      };

      const messageContent = `__STORY_REPLY__${JSON.stringify(storyMetadata)}__END_STORY_REPLY__`;

      await sendMessage(conversation_id, {
        content: messageContent,
        message_type: "text",
      });

      return true;
    } catch (error) {
      console.error("Failed to send story message:", error);
      throw error;
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      await sendStoryMessage(replyText);
      toast.success("Reply sent");
      setReplyText("");
      setIsTyping(false);
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleReactionClick = async (emoji: string) => {
    try {
      await sendStoryMessage(emoji, true);
      toast.success("Reaction sent");
    } catch (error) {
      toast.error("Failed to send reaction");
    }
  };

  const handleReplyKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

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

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const renderStoryContent = () => {
    if (currentStory.story_type === "text") {
      setTimeout(() => setIsLoading(false), 100);
      return (
        <div
          className="absolute inset-0 flex items-center justify-center p-8"
          style={{
            background: currentStory.background_gradient || currentStory.background_color || "#000",
          }}
        >
          <p className="text-white text-2xl md:text-3xl font-bold text-center leading-relaxed drop-shadow-2xl">
            {currentStory.content}
          </p>
        </div>
      );
    }

    if (currentStory.story_type === "image") {
      return (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-10">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}
          <img
            src={currentStory.media_url || ""}
            alt="Story"
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              filter: currentStory.filter_css || "none",
            }}
            onLoad={handleImageLoad}
            onError={() => {
              setIsLoading(false);
              toast.error("Failed to load image");
            }}
          />
        </>
      );
    }

    if (currentStory.story_type === "video") {
      return (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-10">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}
          <video
            ref={videoRef}
            src={currentStory.media_url || ""}
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              filter: currentStory.filter_css || "none",
            }}
            autoPlay
            loop={false}
            muted={isMuted}
            playsInline
            onLoadedMetadata={handleVideoLoad}
            onError={() => {
              setIsLoading(false);
              toast.error("Failed to load video");
            }}
          />
        </>
      );
    }

    return null;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-md flex items-center justify-center">
        <div className="relative w-full max-w-md h-full md:h-[90vh] bg-gradient-to-br from-black via-gray-900 to-black md:rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1.5 p-3">
            {stories.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-gradient-to-r from-white to-white transition-all duration-100"
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
          <div className="absolute -top-4 h-20 left-0 right-0 z-20 flex items-center justify-between px-4 mt-3 bg-gradient-to-b from-black/20 to-transparent pb-6"></div>

          <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 mt-3 bg-transparent pb-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11 ring-2 ring-muted/50 shadow-lg">
                <AvatarImage
                  src={userStories.user_avatar || ""}
                  alt={userStories.username}
                />
                <AvatarFallback className="">
                  {userStories.username.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <p className="font-bold text-sm drop-shadow-lg">
                  @{userStories.username}
                </p>
                <p className="text-xs text-white/90 drop-shadow-md">
                  {getTimeAgo(currentStory.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwnStory && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowViewersModal(true)}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </>
              )}
              {!isOwnStory && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPaused(!isPaused)}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                >
                  {isPaused ? (
                    <Play className="w-5 h-5" />
                  ) : (
                    <Pause className="w-5 h-5" />
                  )}
                </Button>
              )}
              {currentStory.story_type === "video" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div
            className="absolute inset-0 flex"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div
              className="flex-1 cursor-pointer"
              onClick={handlePrevious}
            />
            <div
              className="flex-1 cursor-pointer"
              onClick={handleNext}
            />
          </div>

          {renderStoryContent()}

          {currentStory.caption && (
            <div className="absolute bottom-20 left-0 right-0 z-20 px-6">
              <p className="text-white text-sm text-center drop-shadow-lg bg-black/40 backdrop-blur-sm rounded-full py-3 px-4">
                {currentStory.caption}
              </p>
            </div>
          )}

          {!isOwnStory && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center gap-2">
                <Input
                  value={replyText}
                  onChange={handleReplyChange}
                  onKeyPress={handleReplyKeyPress}
                  placeholder={`Reply to @${userStories.username}...`}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md rounded-full"
                  disabled={isSendingReply}
                />
                {replyText.trim() && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSendReply}
                    disabled={isSendingReply}
                    className="bg-primary/80 hover:bg-primary text-white rounded-full"
                  >
                    {isSendingReply ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                )}
                {!replyText.trim() && (
                  <div className="flex gap-1">
                    {["❤️", "😂", "👍"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReactionClick(emoji)}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStoryIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {currentStoryIndex < totalStories - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showViewersModal} onOpenChange={setShowViewersModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Viewers ({currentStory?.views_count || 0})
            </DialogTitle>
          </DialogHeader>
          {viewsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : views.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No views yet
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-3">
                {views.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={view.avatar || ""} alt={view.username} />
                      <AvatarFallback>
                        {view.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {view.full_name || view.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{view.username}
                      </p>
                    </div>
                    {view.viewed_at && (
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(view.viewed_at)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
