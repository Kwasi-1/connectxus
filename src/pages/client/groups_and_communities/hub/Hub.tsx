import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Users,
  Search,
  ArrowRight,
  Briefcase,
  BookOpen,
  Heart,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGroups, getUserGroups, Group } from "@/api/groups.api";
import {
  getCommunities,
  getUserCommunities,
  Community,
} from "@/api/communities.api";
import { getPublicEvents, Event } from "@/api/events.api";
import { format } from "date-fns";

type HubTab = "groups" | "joined" | "communities" | "events";

const Hub = () => {
  const [activeTab, setActiveTab] = useState<HubTab>("groups");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [communitySearchQuery, setCommunitySearchQuery] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
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

  const { data: publicEvents = [], isLoading: loadingPublicEvents } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const isLoading =
    loadingAllGroups ||
    loadingUserGroups ||
    loadingAllCommunities ||
    loadingUserCommunities ||
    loadingPublicEvents;

  const recommendedGroups = allGroups.filter((g) => !g.is_member);

  const recommendedCommunities = allCommunities.filter((c) => !c.is_member);

  const joinedItems = [
    ...userGroups.map((g) => ({ ...g, type: "group" as const })),
    ...userCommunities.map((c) => ({ ...c, type: "community" as const })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <h2 className="text-xl tracking-wider font-[600] custom-font text-foreground">
                Hub
              </h2>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const GroupCard = ({ group }: { group: Group }) => {
    const getGroupTypeIcon = () => {
      switch (group.group_type) {
        case "project":
          return <Briefcase className="h-4 w-4" />;
        case "study":
          return <BookOpen className="h-4 w-4" />;
        case "social":
          return <Heart className="h-4 w-4" />;
        default:
          return <Users className="h-4 w-4" />;
      }
    };

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/groups/${group.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={group.avatar || undefined} />
              <AvatarFallback>{group.name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base mb-1 truncate">
                {group.name}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {group.category}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-xs flex items-center gap-1"
                >
                  {getGroupTypeIcon()}
                  <span className="capitalize">{group.group_type}</span>
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {group.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {group.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{group.member_count} members</span>
            </div>
            <Button size="sm" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CommunityCard = ({ community }: { community: Community }) => (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/communities/${community.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={community.cover_image || undefined} />
            <AvatarFallback>{community.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base mb-1 truncate">
              {community.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {community.category}
              </Badge>
              {!community.is_public && (
                <Badge variant="secondary" className="text-xs">
                  Private
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {community.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {community.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{community.member_count} members</span>
          </div>
          <Button size="sm" variant="ghost">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const JoinedItemCard = ({ item }: { item: any }) => (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() =>
        navigate(
          item.type === "group"
            ? `/groups/${item.id}`
            : `/communities/${item.id}`
        )
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={item.avatar || item.cover_image || undefined} />
            <AvatarFallback>{item.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base mb-1 truncate">
              {item.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">
                {item.type}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{item.member_count} members</span>
          </div>
          <Button size="sm" variant="ghost">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const EventCard = ({ event }: { event: Event }) => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const isMultiDay = startDate.toDateString() !== endDate.toDateString();

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/events/${event.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base mb-1 truncate">
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {event.category}
                </Badge>
                {event.registration_required && (
                  <Badge variant="secondary" className="text-xs">
                    Registration Required
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(startDate, "MMM dd, yyyy")}
              {isMultiDay && ` - ${format(endDate, "MMM dd, yyyy")}`}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{event.registered_count} registered</span>
            </div>
            <Button size="sm" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="border-r border-border h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <h2 className="text-xl tracking-wider font-[600] custom-font text-foreground">
              Hub
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Discover groups, communities, and events
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as HubTab)}
          className="flex-1 flex flex-col"
        >
          <div className="border-b border-border px-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="joined">Joined</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="groups" className="p-4 space-y-6 mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search groups..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {recommendedGroups.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Recommended for You
                  </h3>
                  <div className="grid gap-4">
                    {recommendedGroups
                      .filter(
                        (group) =>
                          !groupSearchQuery ||
                          group.name
                            .toLowerCase()
                            .includes(groupSearchQuery.toLowerCase()) ||
                          group.description
                            ?.toLowerCase()
                            .includes(groupSearchQuery.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((group) => (
                        <GroupCard key={group.id} group={group} />
                      ))}
                  </div>
                </div>
              )}

              {recommendedGroups.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Groups to Explore
                  </h3>
                  <p className="text-muted-foreground">
                    You've joined all available groups
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="joined" className="p-4 space-y-4 mt-0">
              {joinedItems.length > 0 ? (
                <div className="grid gap-4">
                  {joinedItems.map((item) => (
                    <JoinedItemCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Joined Groups or Communities
                  </h3>
                  <p className="text-muted-foreground">
                    Join groups and communities to see them here
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="communities" className="p-4 space-y-6 mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search communities..."
                  value={communitySearchQuery}
                  onChange={(e) => setCommunitySearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {recommendedCommunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Recommended for You
                  </h3>
                  <div className="grid gap-4">
                    {recommendedCommunities
                      .filter(
                        (community) =>
                          !communitySearchQuery ||
                          community.name
                            .toLowerCase()
                            .includes(communitySearchQuery.toLowerCase()) ||
                          community.description
                            ?.toLowerCase()
                            .includes(communitySearchQuery.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((community) => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                        />
                      ))}
                  </div>
                </div>
              )}

              {recommendedCommunities.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Communities to Explore
                  </h3>
                  <p className="text-muted-foreground">
                    You've joined all available communities
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="events" className="p-4 space-y-6 mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {publicEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Upcoming Public Events
                  </h3>
                  <div className="grid gap-4">
                    {publicEvents
                      .filter(
                        (event) =>
                          !eventSearchQuery ||
                          event.title
                            .toLowerCase()
                            .includes(eventSearchQuery.toLowerCase()) ||
                          event.description
                            ?.toLowerCase()
                            .includes(eventSearchQuery.toLowerCase()) ||
                          event.category
                            .toLowerCase()
                            .includes(eventSearchQuery.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                  </div>
                </div>
              )}

              {publicEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Public Events</h3>
                  <p className="text-muted-foreground">
                    No upcoming public events are available
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Hub;
