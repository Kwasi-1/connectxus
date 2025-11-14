import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommunities,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
} from "@/api/communities.api";
import { toast } from "sonner";

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
              <Avatar className="h-12 w-12">
                <AvatarImage src={community.cover_image} alt={community.name} />
                <AvatarFallback>
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
                onClick={() => handleJoinCommunity(community.id, isJoined)}
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
        <div className="sticky top-16 lg:top-0 z-10 bg-background/90 backdrop-blur-md border-border">
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
              <h1 className="text-xl font-bold text-foreground">Communities</h1>
            </div>
          </div>

          <div className="px-4 pb-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search communities..."
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
                My Communities ({myCommunitiesList.length})
              </TabsTrigger>
              <TabsTrigger
                value="explore"
                className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Explore ({exploreCommunitiesList.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4">
          <Tabs value={activeTab}>
            <TabsContent value="my" className="mt-0">
              {filteredCommunities(myCommunitiesList).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || selectedCategory !== "All"
                    ? "No communities found matching your filters"
                    : "You haven't joined any communities yet"}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCommunities(myCommunitiesList).map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      showJoinButton={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="explore" className="mt-0">
              {filteredCommunities(exploreCommunitiesList).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No communities found matching your filters
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCommunities(exploreCommunitiesList).map(
                    (community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        showJoinButton={true}
                      />
                    )
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Communities;
