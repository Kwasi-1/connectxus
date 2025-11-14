import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUserFollowing } from "@/api/users.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewChatModal = ({ open, onOpenChange }: NewChatModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: followingUsers = [], isLoading } = useQuery({
    queryKey: ["following-users", user?.id],
    queryFn: () =>
      user
        ? getUserFollowing(user.id, { page: 1, limit: 100 })
        : Promise.resolve([]),
    enabled: !!user && open,
  });

  const createConversationMutation = useMutation({
    mutationFn: (userId: string) => getOrCreateDirectConversation(userId),
    onSuccess: (data) => {
      onOpenChange(false);
      navigate(`/messages/${data.conversation_id}`);
      toast.success("Chat opened");
    },
    onError: () => {
      toast.error("Failed to create conversation");
    },
  });

  const filteredUsers = followingUsers.filter((user) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower)
    );
  });

  const handleUserSelect = (userId: string) => {
    createConversationMutation.mutate(userId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>
            Search for users you follow to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>
                  {searchQuery
                    ? "No users found matching your search"
                    : "You are not following anyone yet"}
                </p>
                <p className="text-sm mt-2">
                  Follow users to start chatting with them
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((followedUser) => (
                  <div
                    key={followedUser.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleUserSelect(followedUser.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={followedUser.avatar || undefined} />
                      <AvatarFallback>
                        {followedUser.full_name?.[0]?.toUpperCase() ||
                          followedUser.username?.[0]?.toUpperCase() ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">
                          {followedUser.full_name || followedUser.username}
                        </p>
                        {followedUser.verified && (
                          <svg
                            className="h-4 w-4 text-blue-500 flex-shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        @{followedUser.username}
                      </p>
                      {followedUser.department && (
                        <p className="text-xs text-muted-foreground">
                          {followedUser.department}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={createConversationMutation.isPending}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
