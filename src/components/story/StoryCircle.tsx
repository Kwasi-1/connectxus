import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryCircleProps {
  username: string;
  avatar: string;
  hasUnseen?: boolean;
  isAddStory?: boolean;
  onClick?: () => void;
}

export const StoryCircle = ({
  username,
  avatar,
  hasUnseen = false,
  isAddStory = false,
  onClick,
}: StoryCircleProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[70px] group"
    >
      <div className="relative">
        {isAddStory ? (
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30 group-hover:border-muted-foreground/50 transition-colors">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
        ) : (
          <>
            <div
              className={cn(
                "p-[2px] rounded-full",
                hasUnseen
                  ? "bg-gradient-totr bg-muted from-yellow-400 via-pink-500 to-purple-500"
                  : "bg-muted opacity-50"
              )}
            >
              <div className="bg-background p-[2px] rounded-full">
                <Avatar className="w-14 h-14 ring-0">
                  <AvatarImage src={avatar} alt={username} />
                  <AvatarFallback>{username.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </>
        )}
      </div>
      <span className="text-xs text-foreground truncate w-full text-center">
        {username}
      </span>
    </button>
  );
};
