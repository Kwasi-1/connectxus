import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Users, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGroups, getUserGroups, Group } from "@/api/groups.api";
import {
  getCommunities,
  getUserCommunities,
  Community,
} from "@/api/communities.api";
import { HubTab } from "@/types/communities";

const Hub = () => {
  const [activeTab, setActiveTab] = useState<HubTab>("communities");
  const navigate = useNavigate();

  const { data: allGroups = [], isLoading: loadingAllGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const { data: userGroups = [], isLoading: loadingUserGroups } = useQuery({
    queryKey: ["user-groups"],
    queryFn: () => getUserGroups({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const { data: allCommunities = [], isLoading: loadingAllCommunities } =
    useQuery({
      queryKey: ["communities"],
      queryFn: () => getCommunities({ page: 1, limit: 100 }),
      staleTime: 60000,
    });

  const { data: userCommunities = [], isLoading: loadingUserCommunities } =
    useQuery({
      queryKey: ["user-communities"],
      queryFn: () => getUserCommunities({ page: 1, limit: 100 }),
      staleTime: 60000,
    });

  const isLoading =
    loadingAllGroups ||
    loadingUserGroups ||
    loadingAllCommunities ||
    loadingUserCommunities;

  const myCommunities = userCommunities;
  const myGroups = userGroups;
  const exploreCommunities = allCommunities
    .filter((c) => !c.is_member)
    .slice(0, 3);
  const exploreGroups = allGroups.filter((g) => !g.is_member).slice(0, 3);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <h2 className="text-xl tracking-wider font-[600] custom-font text-foreground">
                Communities & Groups
              </h2>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const CommunityCard = ({ community }: { community: Community }) => (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/communities/${community.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={community.cover_image || undefined}
                alt={community.name}
              />
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
                  {community.member_count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {community.description}
        </p>
      </CardContent>
    </Card>
  );

  const GroupCard = ({ group }: { group: Group }) => (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/groups/${group.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-14 w-14 rounded-sm">
              <AvatarImage src={group.avatar || undefined} alt={group.name} className="rounded-sm"/>
              <AvatarFallback className="rounded-sm">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {group.name}
                {!group.is_public && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{group.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {group.member_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {group.description}
        </p>
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {group.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        {/* Header */}
        <div className="sticky top-16 lg:top-0 z-10 bg-background/80 backdrop-blur-md borderb border-border">
          <div className="px-4 py-3">
            <h2 className="text-xl tracking-wider font-[600] custom-font text-foreground">
              Communities & Groups
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as HubTab)}
        >
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            <TabsTrigger
              value="communities"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              My Communities
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              My Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communities" className="mt-0">
            <div className="p-4 space-y-6">
              {/* My Communities */}
              {myCommunities.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Your Communities</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/communities")}
                    className="text-primary"
                  >
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {myCommunities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      You haven't joined any communities yet.
                    </p>
                  ) : (
                    myCommunities
                      .slice(0, 3)
                      .map((community) => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                        />
                      ))
                  )}
                </div>
              </div>)}

              {/* Discover Communities */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Discover Communities
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/communities")}
                    className="text-primary"
                  >
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {exploreCommunities.map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-0">
            <div className="p-4 space-y-6">
              {/* My Groups */}
              {myGroups.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Your Groups</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/groups")}
                    className="text-primary"
                  >
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {myGroups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      You haven't joined any groups yet.
                    </p>
                  ) : (
                    myGroups
                      .slice(0, 3)
                      .map((group) => (
                        <GroupCard key={group.id} group={group} />
                      ))
                  )}
                </div>
              </div>)}

              {/* Discover Groups */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Discover Groups</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/groups")}
                    className="text-primary"
                  >
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {exploreGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Hub;
