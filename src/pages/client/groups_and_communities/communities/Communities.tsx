import { useState, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Users, ArrowLeft, Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommunities,
  getUserCommunities,
  getRecommendedCommunities,
  joinCommunity,
  leaveCommunity,
  createCommunity,
  CreateCommunityRequest,
} from "@/api/communities.api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState<CreateCommunityRequest>({
    name: "",
    description: "",
    category: "",
    is_public: true,
    cover_image: null,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const {
    data: recommendedCommunitiesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingRecommended,
    error: errorRecommended,
    isError: isErrorRecommended,
  } = useInfiniteQuery({
    queryKey: ["recommended-communities", selectedCategory],
    queryFn: ({ pageParam = 1 }) =>
      getRecommendedCommunities({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 60000,
    initialPageParam: 1,
    retry: 2,
  });

  const recommendedCommunities = recommendedCommunitiesData?.pages.flatMap(page => page) ?? [];

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastCommunityRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const isLoading = loadingRecommended || loadingMy;

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

  const createMutation = useMutation({
    mutationFn: (data: CreateCommunityRequest) => createCommunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      toast.success("Community created successfully!");
      setCreateModalOpen(false);
      setNewCommunity({
        name: "",
        description: "",
        category: "",
        is_public: true,
        cover_image: null,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to create community");
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

  const myCommunitiesList = myCommunities;

  const exploreCommunitiesList = recommendedCommunities.filter(
    (c) => !myCommunitiesIds.has(c.id)
  );

  const handleJoinCommunity = (communityId: string, isJoined: boolean) => {
    if (isJoined) {
      leaveMutation.mutate(communityId);
    } else {
      joinMutation.mutate(communityId);
    }
  };

  const handleCreateCommunity = () => {
    if (!newCommunity.name.trim()) {
      toast.error("Community name is required");
      return;
    }
    if (!newCommunity.category) {
      toast.error("Category is required");
      return;
    }
    createMutation.mutate(newCommunity);
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

  if (isErrorRecommended || isErrorMy) {
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
              {(errorRecommended as any)?.message ||
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
              <Button
                onClick={() => setCreateModalOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create
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
                  <>
                    {filteredCommunities(exploreCommunitiesList).map(
                      (community, index) => {
                        const isLastItem = index === filteredCommunities(exploreCommunitiesList).length - 1;
                        return (
                          <div
                            key={community.id}
                            ref={isLastItem ? lastCommunityRef : null}
                          >
                            <CommunityCard
                              community={community}
                              showJoinButton={true}
                            />
                          </div>
                        );
                      }
                    )}
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Community Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>
                Create a new community for campus activities and departments.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  value={newCommunity.name}
                  onChange={(e) =>
                    setNewCommunity((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter community name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCommunity.description || ""}
                  onChange={(e) =>
                    setNewCommunity((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the community's purpose"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newCommunity.category}
                  onValueChange={(value) =>
                    setNewCommunity((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Department">Department</SelectItem>
                    <SelectItem value="Level">Level</SelectItem>
                    <SelectItem value="Hostel">Hostel</SelectItem>
                    <SelectItem value="Faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_public">Public Community</Label>
                  <p className="text-sm text-muted-foreground">
                    Anyone can join a public community
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={newCommunity.is_public}
                  onCheckedChange={(checked) =>
                    setNewCommunity((prev) => ({
                      ...prev,
                      is_public: checked,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCommunity}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Community"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Communities;
