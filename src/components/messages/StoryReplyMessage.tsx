import { useNavigate } from "react-router-dom";
import { MessageCircle, Image as ImageIcon, Type, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryMetadata {
  story_id: string;
  story_type: "text" | "image" | "video";
  story_media_url?: string;
  story_background?: string;
  story_content?: string;
  is_reaction: boolean;
  message: string;
}

interface StoryReplyMessageProps {
  content: string;
  isOwnMessage: boolean;
}

export const StoryReplyMessage = ({
  content,
  isOwnMessage,
}: StoryReplyMessageProps) => {
  const navigate = useNavigate();

  const parseStoryMetadata = (content: string): StoryMetadata | null => {
    const match = content.match(
      /__STORY_REPLY__(.+?)__END_STORY_REPLY__/
    );
    if (!match) return null;

    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  };

  const metadata = parseStoryMetadata(content);
  if (!metadata) return null;

  const getTypeIcon = () => {
    switch (metadata.story_type) {
      case "text":
        return <Type className="w-4 h-4" />;
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getStoryThumbnail = () => {
    if (metadata.story_type === "text") {
      return (
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{
            background: metadata.story_background || "#000",
          }}
        >
          {metadata.story_content?.substring(0, 20)}
        </div>
      );
    }

    if (metadata.story_media_url) {
      return (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
          {metadata.story_type === "video" ? (
            <video
              src={metadata.story_media_url}
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <img
              src={metadata.story_media_url}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      );
    }

    return (
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
        {getTypeIcon()}
      </div>
    );
  };

  const handleStoryClick = () => {
    navigate(`/stories/${metadata.story_id}`);
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleStoryClick}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]",
          isOwnMessage
            ? "bg-primary/20 border border-primary/30"
            : "bg-muted border border-border"
        )}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className={cn(
            "p-2 rounded-full",
            isOwnMessage ? "bg-primary/30" : "bg-primary/20"
          )}>
            {getTypeIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {isOwnMessage ? "You" : "Status"}
            </p>
            <p className="text-xs text-muted-foreground">Tap to view</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {getStoryThumbnail()}
        </div>
      </div>

      <div
        className={cn(
          "px-3 py-2 rounded-lg",
          isOwnMessage ? "bg-primary/10" : "bg-muted/50"
        )}
      >
        <p className="text-sm">
          {metadata.is_reaction ? (
            <span>{metadata.message}</span>
          ) : (
            <span>{metadata.message}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export const isStoryReply = (content: string): boolean => {
  return content.includes("__STORY_REPLY__") && content.includes("__END_STORY_REPLY__");
};

export const extractStoryReplyMessage = (content: string): string => {
  const match = content.match(
    /__STORY_REPLY__(.+?)__END_STORY_REPLY__/
  );
  if (!match) return content;

  try {
    const metadata = JSON.parse(match[1]);
    return metadata.message || content;
  } catch {
    return content;
  }
};
