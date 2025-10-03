import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Users, Lock, Plus, ArrowLeft, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockGroups } from "@/data/mockCommunitiesData";
import { Group, GroupCategory, HubTab } from "@/types/communities";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { useToast } from "@/hooks/use-toast";

const categoryFilters: GroupCategory[] = [
  "Study Group",
  "Sports",
  "Arts",
  "Professional",
  "Academic",
  "Social",
  "Other",
];

const GroupsNew = () => {
  const [activeTab, setActiveTab] = useState<HubTab>("my");
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GroupCategory | "All"
  >("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Application tracking state
  const [pendingJoinRequests, setPendingJoinRequests] = useState<string[]>([]);
  const [pendingRoleApplications, setPendingRoleApplications] = useState<{
    [groupId: string]: string[];
  }>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock current user ID
  const currentUserId = "user-1";

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setGroups(mockGroups);

        // Initialize application state - check for existing applications
        const mockPendingRequests: string[] = []; // In real app, get from API
        const mockPendingRoleApps: { [groupId: string]: string[] } = {}; // In real app, get from API

        // Simulate checking for pending applications
        mockGroups.forEach((group) => {
          if (
            group.groupType === "project" &&
            !group.isJoined &&
            group.projectRoles
          ) {
            // Check if user has any pending applications for this group
            const userApplications: string[] = [];
            group.projectRoles.forEach((role) => {
              const userApp = role.applications.find(
                (app) =>
                  app.userId === currentUserId && app.status === "pending"
              );
              if (userApp) {
                userApplications.push(role.id);
              }
            });
            if (userApplications.length > 0) {
              mockPendingRoleApps[group.id] = userApplications;
            }
          }
        });

        setPendingJoinRequests(mockPendingRequests);
        setPendingRoleApplications(mockPendingRoleApps);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [currentUserId]);

  const filteredGroups = (groupsList: Group[]) => {
    return groupsList.filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || group.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const myGroups = groups.filter((g) => g.isJoined);
  const exploreGroups = groups.filter((g) => !g.isJoined && g.groupType !== 'private');

  const handleJoinGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    // If user is already joined, allow them to leave
    if (group.isJoined) {
      setGroups(
        groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                isJoined: false,
                memberCount: g.memberCount - 1,
              }
            : g
        )
      );
      toast({
        title: "Left group",
        description: `You've left ${group.name}`,
      });
      return;
    }

    // Handle different group types for joining
    if (group.groupType === "private" || (group.requireApproval ?? false)) {
      // For private groups or groups requiring approval, create a join request
      if (!pendingJoinRequests.includes(groupId)) {
        setPendingJoinRequests([...pendingJoinRequests, groupId]);

        toast({
          title: "Request sent!",
          description: `Your request to join ${group.name} has been sent for approval.`,
        });
      }
    } else if (group.groupType === "project") {
      // For project groups, navigate to the group detail page to see roles
      toast({
        title: "View available roles",
        description:
          "Check out the available roles and apply for the ones that interest you.",
      });
      navigate(`/groups/${groupId}`);
    } else {
      // For public groups, join immediately
      setGroups(
        groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                isJoined: true,
                memberCount: g.memberCount + 1,
              }
            : g
        )
      );

      toast({
        title: "Joined group!",
        description: `You've successfully joined ${group.name}`,
      });
    }
  };

  const handleCreateGroup = (
    groupData: Omit<
      Group,
      | "id"
      | "memberCount"
      | "isJoined"
      | "createdAt"
      | "createdBy"
      | "admins"
      | "moderators"
    >
  ) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      ...groupData,
      memberCount: 1,
      isJoined: true,
      createdAt: new Date(),
      createdBy: "current-user",
      admins: ["current-user"],
      moderators: [],
    };

    setGroups([newGroup, ...groups]);
    toast({
      title: "Group Created!",
      description: `${newGroup.name} has been created successfully.`,
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-16 lg:top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/hub")}
                    className="p-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-xl font-bold text-foreground">Groups</h1>
                </div>
              </div>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const getGroupTypeIcon = (groupType: string) => {
    if (groupType === "project")
      return <Briefcase className="h-4 w-4 text-muted-foreground" />;
    if (groupType === "private")
      return <Lock className="h-4 w-4 text-muted-foreground" />;
    return null;
  };

  const getGroupTypeBadge = (group: Group) => {
    if (group.groupType === "project") {
      const totalSlots =
        group.projectRoles?.reduce((acc, role) => acc + role.slotsTotal, 0) ||
        0;
      const filledSlots =
        group.projectRoles?.reduce((acc, role) => acc + role.slotsFilled, 0) ||
        0;
      return (
        <Badge variant="outline" className="text-xs">
          Project {filledSlots}/{totalSlots}
        </Badge>
      );
    }
    if (group.groupType === "private") {
      return (
        <Badge variant="secondary" className="text-xs gap-1">
          <Lock className="h-3 w-3" />
          Private
        </Badge>
      );
    }
    return null;
  };

  const getJoinButtonText = (group: Group) => {
    if (group.isJoined) return "Leave";

    if (pendingJoinRequests.includes(group.id)) return "Request Pending";

    const groupRoleApplications = pendingRoleApplications[group.id] || [];
    if (group.groupType === "project") {
      if (groupRoleApplications.length > 0) {
        return `Applied (${groupRoleApplications.length})`;
      }
      return "View Roles";
    }

    if (group.groupType === "private") return "Request Access";

    return "Join";
  };

  const isJoinButtonDisabled = (group: Group) => {
    if (group.groupType === "project" && !group.isAcceptingApplications)
      return true;
    if (pendingJoinRequests.includes(group.id)) return true;

    const groupRoleApplications = pendingRoleApplications[group.id] || [];
    if (group.groupType === "project" && groupRoleApplications.length > 0)
      return true;

    return false;
  };

  const GroupCard = ({
    group,
    showJoinButton = false,
  }: {
    group: Group;
    showJoinButton?: boolean;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer flex-1"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={group.avatar} alt={group.name} />
              <AvatarFallback>
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {group.name}
                {getGroupTypeIcon(group.groupType)}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{group.category}</Badge>
                {getGroupTypeBadge(group)}
                <span className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {group.memberCount}
                </span>
              </div>
            </div>
          </div>
          {showJoinButton && (
            <Button
              onClick={() => handleJoinGroup(group.id)}
              variant={group.isJoined ? "outline" : "default"}
              size="sm"
              disabled={isJoinButtonDisabled(group)}
            >
              {getJoinButtonText(group)}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {group.description}
        </p>
        {group.groupType === "project" && group.projectDeadline && (
          <p className="text-xs text-muted-foreground mt-2">
            Deadline: {new Date(group.projectDeadline).toLocaleDateString()}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {group.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        {/* Header */}
        <div className="sticky top-16 lg:top-0 z-10 bg-background/90 backdrop-blur-md border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/hub")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-foreground">Groups</h1>
              </div>
              <Button
                className="bg-foreground hover:bg-foreground/90 text-background"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden mdblock ml-2">Create Group</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as HubTab)}
        >
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            <TabsTrigger
              value="my"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              My Groups
            </TabsTrigger>
            <TabsTrigger
              value="explore"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Explore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="mt-0">
            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search your groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>

              {/* Groups Grid */}
              <div className="space-y-3">
                {filteredGroups(myGroups).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No groups found
                    </h3>
                    <p className="text-muted-foreground">
                      {myGroups.length === 0
                        ? "You haven't joined any groups yet"
                        : "Try adjusting your search"}
                    </p>
                  </div>
                ) : (
                  filteredGroups(myGroups).map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explore" className="mt-0">
            <div className="p-4 space-y-4">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("All")}
                    className="rounded-full px-5"
                  >
                    All
                  </Button>
                  {categoryFilters.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="rounded-full"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Groups Grid */}
              <div className="space-y-3">
                {filteredGroups(exploreGroups).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No groups found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  filteredGroups(exploreGroups).map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      showJoinButton={true}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateGroupModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </AppLayout>
  );
};

export default GroupsNew;
