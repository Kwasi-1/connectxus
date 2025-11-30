import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Users, ArrowLeft, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommunities,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
} from "@/api/communities.api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CommunityCategory =
  | "Academic"
  | "Level"
  | "Hostel"
  | "Department"
  | "Faculty";
type HubTab = "my" | "explore";

const categoryFilters: CommunityCategory[] = [
  "Academic",
  "Level",
  "Hostel",
  "Department",
  "Faculty",
];

const Communities = () => {
  const [activeTab, setActiveTab] = useState<HubTab>("my");
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CommunityCategory | "All"
  >("All");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: allCommunities = [],
    isLoading: loadingAll,
    error: errorAll,
    isError: isErrorAll,
  } = useQuery({
    queryKey: ["communities"],
    queryFn: () => getCommunities({ page: 1, limit: 100 }),
    staleTime: 60000,
    retry: 2,
  });

  const {
    data: myCommunities = [],
    isLoading: loadingMy,
    error: errorMy,
    isError: isErrorMy,
  } = useQuery({
    queryKey: ["my-communities"],
    queryFn: () => getUserCommunities({ page: 1, limit: 100 }),
    staleTime: 60000,
    retry: 2,
  });

  const isLoading = loadingAll || loadingMy;

  const joinMutation = useMutation({
    mutationFn: (communityId: string) => joinCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      toast.success("Joined community successfully!");
    },
    onError: () => {
      toast.error("Failed to join community");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (communityId: string) => leaveCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      toast.success("Left community successfully!");
    },
    onError: () => {
      toast.error("Failed to leave community");
    },
  });

  const filteredCommunities = (communitiesList: any[]) => {
    return communitiesList.filter((community) => {
      const matchesSearch =
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (community.description &&
          community.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "All" || community.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const myCommunitiesIds = new Set(myCommunities.map((c) => c.id));

  const myCommunitiesList = allCommunities.filter((c) =>
    myCommunitiesIds.has(c.id)
  );
  const exploreCommunitiesList = allCommunities.filter(
    (c) => !myCommunitiesIds.has(c.id)
  );

  const handleJoinCommunity = (communityId: string, isJoined: boolean) => {
    if (isJoined) {
      leaveMutation.mutate(communityId);
    } else {
      joinMutation.mutate(communityId);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/hub")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-foreground">
                  Communities
                </h1>
              </div>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (isErrorAll || isErrorMy) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/hub")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-foreground">
                  Communities
                </h1>
              </div>
            </div>
          </div>
          <div className="p-4 text-center">
            <p className="text-destructive mb-2">Error loading communities</p>
            <p className="text-sm text-muted-foreground">
              {(errorAll as any)?.message ||
                (errorMy as any)?.message ||
                "Failed to fetch communities"}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const CommunityCard = ({
    community,
    showJoinButton = false,
  }: {
    community: any;
    showJoinButton?: boolean;
  }) => {
    const isJoined = myCommunitiesIds.has(community.id);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer flex-1"
              onClick={() => navigate(`/communities/${community.id}`)}
            >
              <Avatar className="h-14 w-14 rounded-sm">
                <AvatarImage src={community.cover_image} alt={community.name} />
                <AvatarFallback className="h-14 w-14 rounded-sm">
                  {community.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{community.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{community.category}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {community.member_count?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
            {showJoinButton && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinCommunity(community.id, isJoined);
                }}
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
            {community.description || "No description available"}
          </p>
        </CardContent>
      </Card>
    );
  };

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
                <h1 className="text-xl font-bold text-foreground">
                  Communities
                </h1>
              </div>
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
              My Communities
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
                  placeholder="Search your communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>

              {/* Communities Grid */}
              <div className="space-y-3">
                {filteredCommunities(myCommunitiesList).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No communities found
                    </h3>
                    <p className="text-muted-foreground">
                      {myCommunitiesList.length === 0
                        ? "You haven't joined any communities yet"
                        : "Try adjusting your search"}
                    </p>
                  </div>
                ) : (
                  filteredCommunities(myCommunitiesList).map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      showJoinButton={false}
                    />
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
                    placeholder="Search communities..."
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

              {/* Communities Grid */}
              <div className="space-y-3">
                {filteredCommunities(exploreCommunitiesList).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No communities found
                    </h3>
                    <p className="text-muted-foreground">
                      {exploreCommunitiesList.length === 0
                        ? "No communities available to explore"
                        : "Try adjusting your search or filters"}
                    </p>
                  </div>
                ) : (
                  filteredCommunities(exploreCommunitiesList).map(
                    (community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        showJoinButton={true}
                      />
                    )
                  )
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Communities;
