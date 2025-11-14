import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Users, ArrowLeft, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGroups,
  getUserGroups,
  joinGroup,
  leaveGroup,
} from "@/api/groups.api";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { toast } from "sonner";

type GroupCategory =
  | "Study Group"
  | "Sports"
  | "Arts"
  | "Professional"
  | "Academic"
  | "Social"
  | "Other";
type HubTab = "my" | "explore";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GroupCategory | "All"
  >("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: allGroups = [], isLoading: loadingAll } = useQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const { data: myGroupsData = [], isLoading: loadingMy } = useQuery({
    queryKey: ["my-groups"],
    queryFn: () => getUserGroups({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const isLoading = loadingAll || loadingMy;

  const joinMutation = useMutation({
    mutationFn: (groupId: string) => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast.success("Joined group successfully!");
    },
    onError: () => {
      toast.error("Failed to join group");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast.success("Left group successfully!");
    },
    onError: () => {
      toast.error("Failed to leave group");
    },
  });

  const filteredGroups = (groupsList: any[]) => {
    return groupsList.filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description &&
          group.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "All" || group.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const myGroupsIds = new Set(myGroupsData.map((g) => g.id));

  const myGroups = allGroups.filter((g) => myGroupsIds.has(g.id));
  const exploreGroups = allGroups.filter((g) => !myGroupsIds.has(g.id));

  const handleJoinGroup = (groupId: string, isJoined: boolean) => {
    if (isJoined) {
      leaveMutation.mutate(groupId);
    } else {
      joinMutation.mutate(groupId);
    }
  };

  const handleCreateGroup = () => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    queryClient.invalidateQueries({ queryKey: ["my-groups"] });
    setIsCreateModalOpen(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
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

  const GroupCard = ({
    group,
    showJoinButton = false,
  }: {
    group: any;
    showJoinButton?: boolean;
  }) => {
    const isJoined = myGroupsIds.has(group.id);
    const isProject = group.group_type === "project";

    return (
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
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  {isProject && (
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{group.category}</Badge>
                  <Badge variant="outline">{group.group_type}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {group.member_count?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
            {showJoinButton && (
              <Button
                onClick={() => handleJoinGroup(group.id, isJoined)}
                variant={isJoined ? "outline" : "default"}
                size="sm"
                disabled={joinMutation.isPending || leaveMutation.isPending}
              >
                {isJoined ? "Leave" : "Join"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {group.description || "No description available"}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
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
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                className="gap-2"
              >
                Create Group
              </Button>
            </div>
          </div>

          <div className="px-4 pb-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("All")}
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
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as HubTab)}
          >
            <TabsList className="w-full rounded-none bg-transparent border-b border-border">
              <TabsTrigger
                value="my"
                className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                My Groups ({myGroups.length})
              </TabsTrigger>
              <TabsTrigger
                value="explore"
                className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Explore ({exploreGroups.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4">
          <Tabs value={activeTab}>
            <TabsContent value="my" className="mt-0">
              {filteredGroups(myGroups).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || selectedCategory !== "All"
                    ? "No groups found matching your filters"
                    : "You haven't joined any groups yet"}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGroups(myGroups).map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      showJoinButton={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="explore" className="mt-0">
              {filteredGroups(exploreGroups).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No groups found matching your filters
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGroups(exploreGroups).map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      showJoinButton={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateGroup}
      />
    </AppLayout>
  );
};

export default GroupsNew;
