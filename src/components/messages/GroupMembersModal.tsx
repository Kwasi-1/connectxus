import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Crown, Shield, UserMinus } from "lucide-react";
import { GroupMember } from "@/types/messages";

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GroupMember[];
  isAdmin: boolean;
  isModerator: boolean;
  onRemoveMember?: (memberId: string) => void;
  onPromoteMember?: (memberId: string, role: "admin" | "moderator") => void;
}

export const GroupMembersModal = ({
  isOpen,
  onClose,
  members,
  isAdmin,
  isModerator,
  onRemoveMember,
  onPromoteMember,
}: GroupMembersModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: "admin" | "moderator" | "member") => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: "admin" | "moderator" | "member") => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="secondary" className="text-xs">
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge variant="outline" className="text-xs">
            Moderator
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Group Members ({members.length})</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{member.name}</p>
                      {getRoleIcon(member.role)}
                      {getRoleBadge(member.role)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {member.joinedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {(isAdmin || (isModerator && member.role === "member")) &&
                  member.role !== "admin" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isAdmin && member.role === "member" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                onPromoteMember?.(member.id, "moderator")
                              }
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onPromoteMember?.(member.id, "admin")
                              }
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          </>
                        )}
                        {isAdmin && member.role === "moderator" && (
                          <DropdownMenuItem
                            onClick={() =>
                              onPromoteMember?.(member.id, "admin")
                            }
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onRemoveMember?.(member.id)}
                          className="text-destructive"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
