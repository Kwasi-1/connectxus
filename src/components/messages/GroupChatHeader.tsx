
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Search, 
  Phone, 
  MoreHorizontal, 
  Pin, 
  PinOff, 
  UserPlus, 
  Settings, 
  LogOut,
  Users
} from 'lucide-react';
import { GroupChat } from '@/types/messages';

interface GroupChatHeaderProps {
  groupChat: GroupChat;
  onBack: () => void;
  onToggleSearch: () => void;
  onPinChat: () => void;
  onLeaveGroup: () => void;
  onManageGroup: () => void;
  onAddMembers: () => void;
  onViewMembers: () => void;
}

export const GroupChatHeader = ({
  groupChat,
  onBack,
  onToggleSearch,
  onPinChat,
  onLeaveGroup,
  onManageGroup,
  onAddMembers,
  onViewMembers
}: GroupChatHeaderProps) => {
  const navigate = useNavigate();

  const handleGroupProfileClick = () => {
    navigate(`/groups/${groupChat.id}`);
  };

  return (
    <div className="p-4 border-b border-border flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* Back button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onBack}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="relative cursor-pointer" onClick={handleGroupProfileClick}>
          <Avatar className="w-10 h-10 hover:ring-2 hover:ring-primary/20 transition-all">
            <AvatarImage src={groupChat.avatar} alt={groupChat.name} />
            <AvatarFallback>{groupChat.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background flex items-center justify-center">
            <Users className="h-2 w-2 text-primary-foreground" />
          </div>
        </div>
        <div className="cursor-pointer" onClick={handleGroupProfileClick}>
          <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <h3 className="font-semibold text-foreground">{groupChat.name}</h3>
            {groupChat.isAdmin && (
              <Badge variant="secondary" className="text-xs hidden md:block">Admin</Badge>
            )}
            {groupChat.isModerator && !groupChat.isAdmin && (
              <Badge variant="outline" className="text-xs hidden md:block">Moderator</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {groupChat.memberCount} members
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Search Messages Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSearch}
        >
          <Search className="h-5 w-5" />
        </Button>
        
        {/* View Members Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onViewMembers}
        >
          <Users className="h-5 w-5" />
        </Button>
        
        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={onPinChat}>
              {groupChat.isPinned ? (
                <>
                  <PinOff className="h-4 w-4 mr-2" />
                  Unpin Group
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin Group
                </>
              )}
            </DropdownMenuItem>
            {(groupChat.isAdmin || groupChat.isModerator) && (
              <DropdownMenuItem onClick={onAddMembers}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Members
              </DropdownMenuItem>
            )}
            {groupChat.isAdmin && (
              <DropdownMenuItem onClick={onManageGroup}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Group
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onLeaveGroup} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Leave Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
