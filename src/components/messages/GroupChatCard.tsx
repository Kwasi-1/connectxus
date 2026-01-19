import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Users } from "lucide-react";
import { GroupChat } from "@/types/messages";
import { extractStoryReplyMessage } from "./StoryReplyMessage";

interface GroupChatCardProps {
  groupChat: GroupChat;
  isSelected: boolean;
  onClick: () => void;
}

export const GroupChatCard = ({
  groupChat,
  isSelected,
  onClick,
}: GroupChatCardProps) => {
  return (
    <div className="border-b border-border/50 pb-1">
      <div
        onClick={onClick}
        className={`p-4 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
          isSelected ? "bg-muted/60" : ""
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <Avatar className="w-12 h-12">
              <AvatarImage src={groupChat.avatar} alt={groupChat.name} />
              <AvatarFallback>{groupChat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background flex items-center justify-center">
              <Users className="h-2 w-2 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {groupChat.name}
                </h3>
                {groupChat.isPinned && (
                  <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                )}
                {groupChat.isAdmin && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Admin
                  </Badge>
                )}
                {groupChat.isModerator && !groupChat.isAdmin && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Mod
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground flex-shrink-0 ml-2">
                {groupChat.timestamp}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate pr-2">
                  {extractStoryReplyMessage(groupChat.lastMessage)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {groupChat.memberCount} members
                </p>
              </div>
              {groupChat.unreadCount > 0 && (
                <Badge className="bg-foreground/80 text-primary-foreground flex-shrink-0">
                  {groupChat.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
