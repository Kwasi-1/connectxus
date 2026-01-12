import { useState, useEffect } from "react";
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
  Lock,
  Search,
  ArrowRight,
  Briefcase,
  BookOpen,
  Heart,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getGroups,
  getRecommendedGroups,
  getUserGroups,
  Group,
} from "@/api/groups.api";
import {
  getCommunities,
  getUserCommunities,
  getRecommendedCommunities,
  Community,
} from "@/api/communities.api";
import { getRecommendedEvents, getUserRegisteredEvents, Event } from "@/api/events.api";
import { format } from "date-fns";
import { toast } from "sonner";
import { EventCard } from "@/components/events/EventCard";
import { EventDetailModal } from "@/components/events/EventDetailModal";
import { useInView } from "react-intersection-observer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

import { HubTab } from "@/types/communities";

const Hub = () => {
  const [activeTab, setActiveTab] = useState<HubTab>("communities");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<"registered" | "not-registered">("not-registered");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [showMySpaceEventsOnly, setShowMySpaceEventsOnly] = useState(false);
  const [pendingShowMySpaceEventsOnly, setPendingShowMySpaceEventsOnly] = useState(false);

  const navigate = useNavigate();
  const { ref: infiniteScrollRef, inView } = useInView();

  const {
    data: recommendedGroups = [],
    isLoading: loadingRecommendedGroups,
    error: groupsError,
  } = useQuery({
    queryKey: ["recommended-groups"],
    queryFn: () => getRecommendedGroups({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

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

  const { data: recommendedCommunities = [], isLoading: loadingRecommendedCommunities } =
    useQuery({
      queryKey: ["recommended-communities"],
      queryFn: () => getRecommendedCommunities({ page: 1, limit: 100 }),
      staleTime: 60000,
    });

  const {
    data: eventsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingEvents,
  } = useInfiniteQuery({
    queryKey: ["hub-events", eventFilter, showMySpaceEventsOnly],
    queryFn: ({ pageParam = 1 }) => {
      const params: any = {
        page: pageParam,
        limit: 20,
      };

      if (showMySpaceEventsOnly) {
        const storedUser = localStorage.getItem("auth-user");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.space_id) {
              params.space_id = user.space_id;
            }
          } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
          }
        }
      }

      if (eventFilter === "registered") {
        return getUserRegisteredEvents(params);
      } else {
        return getRecommendedEvents(params);
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allEvents = eventsData?.pages.flatMap((page) => page) || [];

  const isLoading =
    loadingAllGroups ||
    loadingUserGroups ||
    loadingAllCommunities ||
    loadingUserCommunities ||
    loadingRecommendedGroups ||
    loadingRecommendedCommunities;

  const myCommunities = userCommunities;
  const myGroups = userGroups;

  const joinedCommunityIds = new Set(userCommunities.map(c => c.id));
  const exploreCommunities = recommendedCommunities
    .filter(c => !joinedCommunityIds.has(c.id))
    .slice(0, 3);

  const joinedGroupIds = new Set(userGroups.map(g => g.id));
  const exploreGroups = recommendedGroups
    .filter(g => !joinedGroupIds.has(g.id))
    .slice(0, 3);

  const handleApplyFilters = () => {
    setShowMySpaceEventsOnly(pendingShowMySpaceEventsOnly);
    setFilterSheetOpen(false);
  };

  const handleResetFilters = () => {
    setPendingShowMySpaceEventsOnly(false);
  };

  const handleClearAllFilters = () => {
    setPendingShowMySpaceEventsOnly(false);
    setShowMySpaceEventsOnly(false);
  };

  const getActiveFilterCount = () => {
    return showMySpaceEventsOnly ? 1 : 0;
  };

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
            <Avatar className="h-14 w-14 rounded-sm">
              <AvatarImage
                src={community.cover_image || undefined}
                alt={community.name}
              />
              <AvatarFallback className="rounded-sm">
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
              <AvatarImage
                src={group.avatar || undefined}
                alt={group.name}
                className="rounded-sm"
              />
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
              className="px-1 mx-auto h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground hover:border-foreground/20"
            >
              My Communities
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="px-1 mx-auto h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground hover:border-foreground/20"
            >
              My Groups
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="px-1 mx-auto h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground hover:border-foreground/20"
            >
              Events
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
                </div>
              )}

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
                  {exploreCommunities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No communities to discover at the moment.
                    </p>
                  ) : (
                    exploreCommunities.map((community) => (
                      <CommunityCard key={community.id} community={community} />
                    ))
                  )}
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
                </div>
              )}

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
                  {exploreGroups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No groups to discover at the moment.
                    </p>
                  ) : (
                    exploreGroups.map((group) => (
                      <GroupCard key={group.id} group={group} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="p-4 space-y-4 mt-0">
            {/* Search Bar and Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>

              <Button
                variant="outline"
                className="hover:bg-app-hover px-3.5 text-app-text-main transition-colors border border-app-border rounded-full relative"
                onClick={() => setFilterSheetOpen(true)}
                title="Filter events"
              >
                <Filter className="h-5 w-5" />
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
            </div>

            {/* Active Filters */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {showMySpaceEventsOnly && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={handleClearAllFilters}
                  >
                    All events in my space
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="h-6 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-muted rounded-full px-[2px] py-[1.5px] h-10 text-muted-foreground">
              <Button
                size="sm"
                variant={eventFilter === "not-registered" ? "outline" : "light"}
                onClick={() => setEventFilter("not-registered")}
                className={`flex-1 rounded-full h-full  ${
                  eventFilter === "not-registered" && "hover:bg-background text-foreground"
                }`}
              >
                Recommended
              </Button>
              <Button
                size="sm"
                variant={eventFilter === "registered" ? "outline" : "light"}
                onClick={() => setEventFilter("registered")}
                className={`flex-1 rounded-full h-full ${
                  eventFilter === "registered" && "hover:bg-background text-foreground"
                }`}
              >
                Registered
              </Button>
            </div>

            {/* Events List */}
            {loadingEvents && allEvents.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {allEvents.length > 0 ? (
                  <div className="space-y-4">
                    {allEvents
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
                      .map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => {
                            if (event.group_id) {
                              navigate(`/groups/${event.group_id}?tab=events`);
                            } else if (event.community_id) {
                              navigate(`/communities/${event.community_id}?tab=events`);
                            } else {
                              setSelectedEvent(event);
                            }
                          }}
                          showRegistrationStatus={true}
                        />
                      ))}

                    {hasNextPage && (
                      <div ref={infiniteScrollRef} className="flex justify-center py-4">
                        {isFetchingNextPage && (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {eventFilter === "registered" ? "No Registered Events" : "No Events Available"}
                    </h3>
                    <p className="text-muted-foreground">
                      {eventFilter === "registered"
                        ? "You haven't registered for any events yet"
                        : "No recommended events are available at the moment"}
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Filter Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter Events</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Space Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="my-space-events"
                checked={pendingShowMySpaceEventsOnly}
                onCheckedChange={(checked) =>
                  setPendingShowMySpaceEventsOnly(checked === true)
                }
              />
              <label
                htmlFor="my-space-events"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                All events in my space
              </label>
            </div>
          </div>

          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={handleResetFilters} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => {
            if (!open) setSelectedEvent(null);
          }}
          canManage={false}
        />
      )}
    </AppLayout>
  );
};

export default Hub;
