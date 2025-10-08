import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Crown, Lock, Globe, Briefcase, Flag } from "lucide-react";
import { AdminGroup } from "@/data/mockAdminCommunitiesData";

interface GroupDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AdminGroup | null;
}

export function GroupDetailsModal({
  open,
  onOpenChange,
  group,
}: GroupDetailsModalProps) {
  if (!group) return null;

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case "private":
        return <Lock className="h-4 w-4" />;
      case "public":
        return <Globe className="h-4 w-4" />;
      case "project":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Crown className="h-4 w-4" />;
    }
  };

  const getGroupTypeBadge = (type: string) => {
    const colors = {
      public: "bg-green-100 text-green-800",
      private: "bg-blue-100 text-blue-800",
      project: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge
        className={
          colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
    };
    return (
      <Badge
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Group Details</DialogTitle>
          <DialogDescription>
            View detailed information about {group.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={group.avatar} />
              <AvatarFallback>
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {group.name}
                {getGroupTypeIcon(group.groupType)}
              </h3>
              <p className="text-muted-foreground">{group.description}</p>
              <div className="flex gap-2 mt-2">
                {getGroupTypeBadge(group.groupType)}
                {getStatusBadge(group.status)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Category:
                  </span>
                  <span className="ml-2">{group.category}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Members:
                  </span>
                  <span className="ml-2">{group.memberCount}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Created:
                  </span>
                  <span className="ml-2">
                    {group.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Last Activity:
                  </span>
                  <span className="ml-2">
                    {group.lastActivity.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Creator Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={group.creatorInfo.avatar} />
                    <AvatarFallback className="text-xs">
                      {group.creatorInfo.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">
                      {group.creatorInfo.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {group.creatorInfo.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {group.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {group.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {group.groupType === "project" && group.projectRoles && (
            <div>
              <h4 className="text-sm font-medium mb-2">Project Roles</h4>
              <div className="space-y-2">
                {group.projectRoles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{role.name}</h5>
                      <Badge variant="outline">
                        {role.slotsFilled}/{role.slotsTotal}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>
              {group.projectDeadline && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Project Deadline:{" "}
                      {group.projectDeadline.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {group.flags > 0 && (
            <div className="bg-destructive/10 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  This group has {group.flags} flag
                  {group.flags !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
