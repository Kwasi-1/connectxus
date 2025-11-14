import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus, Copy, Users } from "lucide-react";
import { User } from "@/types/global";
import { ProjectRole } from "@/types/communities";
import { useToast } from "@/hooks/use-toast";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  followedUsers: User[];
  groupType: "public" | "private" | "project";
  groupId: string;
  projectRoles?: ProjectRole[];
  onAddMember: (user: User, role?: string) => void;
}

export const AddMemberModal = ({
  isOpen,
  onClose,
  followedUsers,
  groupType,
  groupId,
  projectRoles,
  onAddMember,
}: AddMemberModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();

  const filteredUsers = followedUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = searchQuery === "" || filteredUsers.length > 0;
  const isSearching = searchQuery.length > 0;

  const handleCopyGroupLink = () => {
    const groupUrl = `${window.location.origin}/groups/${groupId}`;
    navigator.clipboard.writeText(groupUrl);
    toast({
      title: "Group link copied!",
      description: "Share this link with the person you want to invite",
    });
  };

  const handleAddUser = (user: User) => {
    if (groupType === "project" && !selectedRole) {
      toast({
        title: "Role required",
        description: "Please select a role for the project member",
        variant: "destructive",
      });
      return;
    }

    onAddMember(user, selectedRole);
    onClose();
    setSearchQuery("");
    setSelectedRole("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add Member ({followedUsers.length} following)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people you follow..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {groupType === "project" &&
            projectRoles &&
            projectRoles.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role for the member" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectRoles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name} ({role.slotsFilled}/{role.slotsTotal}{" "}
                        filled)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          <div className="max-h-96 overflow-y-auto space-y-2">
            {hasResults ? (
              <>
                {(isSearching ? filteredUsers : followedUsers).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>
                          {user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddUser(user)}
                      className="h-8"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">You don't follow this person</p>
                  <p className="text-sm text-muted-foreground">
                    {groupType === "private"
                      ? "Share the group link to invite them"
                      : "Share the group link for them to join"}
                  </p>
                </div>
                <Button
                  onClick={handleCopyGroupLink}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Group Link
                </Button>
              </div>
            )}
          </div>

          {hasResults && (
            <div className="pt-4 border-t">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't see who you're looking for?
                </p>
                <Button
                  onClick={handleCopyGroupLink}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Group Link to Share
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
