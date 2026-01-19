import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  UserPlus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { SpaceSwitcher } from "@/components/admin/SpaceSwitcher";
import { CreateSpaceModal } from "@/components/admin/CreateSpaceModal";
import { AddDepartmentModal } from "@/components/admin/AddDepartmentModal";
import { adminApi } from "@/api/admin.api";

interface Space {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  logo?: string;
  cover_image?: string;
  location?: string;
  website?: string;
  contact_email?: string;
  phone_number?: string;
  status: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  actor_name?: string;
  created_at: string;
}

interface SpaceStats {
  name: string;
  slug: string;
  user_count: number;
  post_count: number;
  community_count: number;
  group_count: number;
}

const SpaceActivities = () => {
  const [currentSpaceId, setCurrentSpaceId] = useState<string>("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [createSpaceModalOpen, setCreateSpaceModalOpen] = useState(false);
  const [addDepartmentModalOpen, setAddDepartmentModalOpen] = useState(false);

  const { data: spacesResponse, isLoading: loadingSpaces } = useQuery({
    queryKey: ["spaces"],
    queryFn: adminApi.getSpaces,
    staleTime: 5 * 60 * 1000,
  });

  const spaces = React.useMemo(() => {
    if (!spacesResponse) return [];

    try {
      if (
        spacesResponse.data?.spaces &&
        Array.isArray(spacesResponse.data.spaces)
      ) {
        return spacesResponse.data.spaces;
      }

      if (spacesResponse.spaces && Array.isArray(spacesResponse.spaces)) {
        return spacesResponse.spaces;
      }

      if (Array.isArray(spacesResponse)) {
        return spacesResponse;
      }

      if (spacesResponse.data && Array.isArray(spacesResponse.data)) {
        return spacesResponse.data;
      }

      for (const key in spacesResponse) {
        if (Array.isArray(spacesResponse[key])) {
          return spacesResponse[key];
        }
      }
    } catch (error) {
      console.error("Error parsing spaces response:", error);
    }

    return [];
  }, [spacesResponse]);

  React.useEffect(() => {
    if (spaces.length > 0 && !currentSpaceId) {
      setCurrentSpaceId(spaces[0].id);
    }
  }, [spaces, currentSpaceId]);

  const {
    data: activitiesResponse,
    isLoading: loadingActivities,
    isFetching: fetchingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: ["space-activities", currentSpaceId, activityFilter],
    queryFn: () => adminApi.getSpaceActivities(currentSpaceId, activityFilter),
    enabled: !!currentSpaceId,
    staleTime: 30000,
    keepPreviousData: true,
  });

  const {
    data: statsResponse,
    isLoading: loadingStats,
    isFetching: fetchingStats,
  } = useQuery({
    queryKey: ["space-stats", currentSpaceId],
    queryFn: () => adminApi.getSpaceStats(currentSpaceId),
    enabled: !!currentSpaceId && currentSpaceId !== "all",
    staleTime: 60000,
    keepPreviousData: true,
  });

  const activities = React.useMemo(() => {
    if (!activitiesResponse) return [];

    try {
      if (
        activitiesResponse.data?.activities &&
        Array.isArray(activitiesResponse.data.activities)
      ) {
        return activitiesResponse.data.activities;
      }

      if (
        activitiesResponse.activities &&
        Array.isArray(activitiesResponse.activities)
      ) {
        return activitiesResponse.activities;
      }

      if (Array.isArray(activitiesResponse)) {
        return activitiesResponse;
      }

      if (activitiesResponse.data && Array.isArray(activitiesResponse.data)) {
        return activitiesResponse.data;
      }
    } catch (error) {
      console.error("Error parsing activities response:", error);
    }

    return [];
  }, [activitiesResponse]);

  const stats = React.useMemo(() => {
    if (!statsResponse) return null;

    try {
      if (
        statsResponse.data &&
        typeof statsResponse.data === "object" &&
        statsResponse.data !== null
      ) {
        return statsResponse.data;
      }

      if (statsResponse.name || statsResponse.user_count !== undefined) {
        return statsResponse;
      }
    } catch (error) {
      console.error("Error parsing stats response:", error);
    }

    return null;
  }, [statsResponse]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_joined":
        return <UserPlus className="h-4 w-4 text-white" />;
      case "post_created":
        return <FileText className="h-4 w-4 text-white" />;
      case "comment_created":
        return <MessageSquare className="h-4 w-4 text-white" />;
      case "event_created":
        return <Calendar className="h-4 w-4 text-white" />;
      case "community_created":
        return <Users className="h-4 w-4 text-white" />;
      case "group_created":
        return <Users className="h-4 w-4 text-white" />;
      default:
        return <Activity className="h-4 w-4 text-white" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_joined":
        return "bg-green-500";
      case "post_created":
        return "bg-blue-500";
      case "comment_created":
        return "bg-purple-500";
      case "event_created":
        return "bg-orange-500";
      case "community_created":
        return "bg-cyan-500";
      case "group_created":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatActivityType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSpaceChange = (spaceId: string) => {
    setCurrentSpaceId(spaceId);
    toast.success("Space switched successfully");
  };

  const handleCreateSpace = () => {
    setCreateSpaceModalOpen(true);
  };

  const handleSpaceCreated = (spaceId: string) => {
    setCurrentSpaceId(spaceId);
    toast.success("New space created and activated");
  };

  if (loadingSpaces) {
    return (
      <AdminPageLayout
        title="Space Activities"
        description="Monitor and analyze space-level activities in real-time"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  if (!loadingSpaces && spaces.length === 0) {
    return (
      <AdminPageLayout
        title="Space Activities"
        description="Monitor and analyze space-level activities in real-time"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No Spaces Found</p>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first space to start monitoring activities
              </p>
              <Button onClick={handleCreateSpace}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Space
              </Button>
            </div>
          </CardContent>
        </Card>
        <CreateSpaceModal
          open={createSpaceModalOpen}
          onOpenChange={setCreateSpaceModalOpen}
          onSuccess={handleSpaceCreated}
        />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Space Activities"
    >
      <div className="space-y-3">
        {currentSpaceId && (
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAddDepartmentModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        {currentSpaceId && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                {loadingStats && !stats ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold tracking-tight">
                      {stats?.user_count?.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Registered users{fetchingStats && " (updating...)"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Posts
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                {loadingStats && !stats ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold tracking-tight">
                      {stats?.post_count?.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all communities{fetchingStats && " (updating...)"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Communities
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                {loadingStats && !stats ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold tracking-tight">
                      {stats?.community_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active communities{fetchingStats && " (updating...)"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Groups
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                {loadingStats && !stats ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold tracking-tight">
                      {stats?.group_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active groups{fetchingStats && " (updating...)"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Space Name
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                </div>
              </CardHeader>
              <CardContent>
                {loadingStats && !stats ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-xl font-bold truncate">
                      {stats?.name || "Unknown"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      @{stats?.slug}
                      {fetchingStats && " (updating...)"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Feed */}
        {currentSpaceId && (
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Activities</CardTitle>
                  <CardDescription className="mt-1">
                    Monitor real-time space activities and user interactions
                    {fetchingActivities && " (updating...)"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={activityFilter}
                    onValueChange={setActivityFilter}
                  >
                    <SelectTrigger className="w-[200px] hover:border-primary/30 transition-colors">
                      <SelectValue placeholder="Filter activities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="user_joined">User Joins</SelectItem>
                      <SelectItem value="post_created">New Posts</SelectItem>
                      <SelectItem value="comment_created">
                        New Comments
                      </SelectItem>
                      <SelectItem value="event_created">New Events</SelectItem>
                      <SelectItem value="community_created">
                        New Communities
                      </SelectItem>
                      <SelectItem value="group_created">New Groups</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingActivities && !activitiesResponse ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activitiesError ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-destructive mb-4" />
                  <p className="text-muted-foreground">
                    Failed to load activities
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activitiesError instanceof Error
                      ? activitiesError.message
                      : "Unknown error"}
                  </p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No recent activities found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try changing the filter to see more activities
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity: ActivityItem) => (
                    <div
                      key={activity.id}
                      className="group flex items-start gap-4 pb-4 border-b last:border-0 hover:bg-muted/30 p-4 rounded-xl transition-all duration-200 hover:shadow-sm"
                    >
                      <div
                        className={`p-3 rounded-xl ${getActivityColor(
                          activity.activity_type
                        )} bg-gradient-to-br shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm`}
                      >
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {activity.actor_name && (
                            <>
                              <span className="text-xs text-muted-foreground font-medium">
                                {activity.actor_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                •
                              </span>
                            </>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(activity.created_at),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 group-hover:border-primary/30 transition-colors"
                      >
                        {formatActivityType(activity.activity_type)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <CreateSpaceModal
          open={createSpaceModalOpen}
          onOpenChange={setCreateSpaceModalOpen}
          onSuccess={handleSpaceCreated}
        />
        {currentSpaceId && (
          <AddDepartmentModal
            open={addDepartmentModalOpen}
            onOpenChange={setAddDepartmentModalOpen}
            spaceId={currentSpaceId}
          />
        )}
      </div>
    </AdminPageLayout>
  );
};

export default SpaceActivities;
