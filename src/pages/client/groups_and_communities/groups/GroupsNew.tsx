import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Users, Lock, Plus, ArrowLeft, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockGroups } from "@/data/mockCommunitiesData";
import { Group, GroupCategory } from "@/types/communities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categoryFilters: GroupCategory[] = [
  "Study Group",
  "Sports",
  "Arts",
  "Professional",
  "Academic",
  "Social",
  "Other",
];

type HubTab = "my-groups" | "explore-groups";


const GroupsNew = () => {
  const [activeTab, setActiveTab] = useState<HubTab>("my-groups");
  const [isLoading, setIsLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GroupCategory | "All"
  >("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setGroups(mockGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

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
  const exploreGroups = groups.filter((g) => !g.isJoined);

  const handleJoinGroup = (groupId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              isJoined: !group.isJoined,
              memberCount: group.isJoined
                ? group.memberCount - 1
                : group.memberCount + 1,
            }
          : group
      )
    );
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
            <Avatar className="h-12 w-12 rounded-sm">
              <AvatarImage src={group.avatar} alt={group.name} />
              <AvatarFallback>
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {group.name}
                {group.groupType === "private" && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{group.category}</Badge>
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
            >
              {group.isJoined
                ? "Leave"
                : group.groupType === "private"
                ? "Request"
                : "Join"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {group.description}
        </p>
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
              <Button className="bg-foreground hover:bg-foreground/90 text-background">
                <Plus className="h-4 w-4" />
                <span className="hidden md:block ml-2">Create Group</span>
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
              value="my-groups"
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

          <TabsContent value="my-groups" className="mt-0">
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
              <div className="flex items-center gap-2 ">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="hover:bg-app-hover px-3.5 text-app-text-main transition-colors border border-app-border rounded-full"
                      title="Filter by category"
                    >
                      <Filter className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[250px] max-h-[400px] overflow-hidden pt-0"
                  >
                    {/* Search Input - Sticky at top */}
                    <div className="sticky top-0 z-10 bg-background p-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="pl-8 h-9 ring-0 focus:ring-0 outline-none focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Scrollable category list */}
                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide scroll-smooth">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCategory("All");
                          setCategorySearch("");
                        }}
                      >
                        All
                      </DropdownMenuItem>

                      {categoryFilters
                        .filter((category) =>
                          category
                            .toLowerCase()
                            .includes(categorySearch.toLowerCase())
                        )
                        .map((category) => (
                          <DropdownMenuItem
                            key={category}
                            onClick={() => {
                              setSelectedCategory(category);
                              setCategorySearch("");
                            }}
                          >
                            {category}
                          </DropdownMenuItem>
                        ))}

                      {categoryFilters.filter((category) =>
                        category
                          .toLowerCase()
                          .includes(categorySearch.toLowerCase())
                      ).length === 0 &&
                        categorySearch && (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            No categories found
                          </div>
                        )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
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
    </AppLayout>
  );
};

export default GroupsNew;
