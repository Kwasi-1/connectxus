import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Trash2,
  Building,
  Star,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { CreateSpaceModal } from "@/components/admin/CreateSpaceModal";
import { AddDepartmentModal } from "@/components/admin/AddDepartmentModal";
import { CreateHighlightModal } from "@/components/admin/CreateHighlightModal";
import { adminApi } from "@/api/admin.api";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  actor_name?: string;
  created_at: string;
}

const SpaceActivities = () => {
  const { selectedSpaceId, isLoading: isLoadingSpaces } = useAdminAuth();
  const [activityFilter, setActivityFilter] = useState("all");
  const [createSpaceModalOpen, setCreateSpaceModalOpen] = useState(false);
  const [addDepartmentModalOpen, setAddDepartmentModalOpen] = useState(false);
  const [createHighlightModalOpen, setCreateHighlightModalOpen] =
    useState(false);
  const queryClient = useQueryClient();

  // Queries
  const {
    data: activitiesResponse,
    isLoading: loadingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: ["space-activities", selectedSpaceId, activityFilter],
    queryFn: () =>
      adminApi.getSpaceActivities(selectedSpaceId!, activityFilter),
    enabled: !!selectedSpaceId,
  });

  const { data: stats } = useQuery({
    queryKey: ["space-stats", selectedSpaceId],
    queryFn: () => adminApi.getSpaceStats(selectedSpaceId!),
    enabled: !!selectedSpaceId,
  });

  const { data: trendingTopics, isLoading: loadingTrending } = useQuery({
    queryKey: ["admin-trending-topics", selectedSpaceId],
    queryFn: () => adminApi.getTrendingTopics(selectedSpaceId!),
    enabled: !!selectedSpaceId,
  });

  const { data: departments, isLoading: loadingDepartments } = useQuery({
    queryKey: ["admin-departments", selectedSpaceId],
    queryFn: () => adminApi.getDepartments(selectedSpaceId),
    enabled: !!selectedSpaceId,
  });

  const { data: highlights, isLoading: loadingHighlights } = useQuery({
    queryKey: ["admin-highlights", selectedSpaceId],
    queryFn: () => adminApi.getCampusHighlights(selectedSpaceId!),
    enabled: !!selectedSpaceId,
  });

  const { data: spacesData, isLoading: loadingSpaces } = useQuery({
    queryKey: ["admin-spaces"],
    queryFn: () => adminApi.getSpaces({ limit: 100 }),
  });

  // Mutations
  const deleteHighlightMutation = useMutation({
    mutationFn: (id: string) => adminApi.removeCampusHighlight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-highlights", selectedSpaceId],
      });
      toast.success("Highlight removed");
    },
    onError: () => toast.error("Failed to remove highlight"),
  });

  const deleteTrendingMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTrendingTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-trending-topics", selectedSpaceId],
      });
      toast.success("Trending topic deleted");
    },
    onError: () => toast.error("Failed to delete topic"),
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-departments", selectedSpaceId],
      });
      toast.success("Department deleted");
    },
    onError: () => toast.error("Failed to delete department"),
  });

  // Helpers
  const activities = React.useMemo(() => {
    if (!activitiesResponse) return [];
    if (Array.isArray(activitiesResponse)) return activitiesResponse;
    const response: any = activitiesResponse;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.activities && Array.isArray(response.activities))
      return response.activities;
    return [];
  }, [activitiesResponse]);

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

  if (isLoadingSpaces) {
    return (
      <AdminPageLayout title="Space Activities">
        <Skeleton className="h-64 w-full" />
      </AdminPageLayout>
    );
  }

  if (!selectedSpaceId) {
    return (
      <AdminPageLayout title="Space Activities">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Space Selected</p>
            <p className="text-sm text-muted-foreground mb-6">
              Select a space from the top bar to manage activities.
            </p>
          </CardContent>
        </Card>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Space Activities">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Reusing existing stats card structure but simplified */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.user_count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.post_count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communities</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.community_count || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Groups</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.group_count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="spaces">Spaces</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="highlights">Campus Highlights</TabsTrigger>
          </TabsList>

          <TabsContent value="spaces" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setCreateSpaceModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Space
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Spaces</CardTitle>
                <CardDescription>
                  Manage all spaces in the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSpaces ? (
                  <Skeleton className="h-40 w-full" />
                ) : !spacesData?.spaces?.length ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active spaces found.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spacesData.spaces.map((space: any) => (
                        <TableRow key={space.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {space.logo ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={space.logo} />
                                  <AvatarFallback>
                                    {space.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Building className="h-4 w-4 text-muted-foreground" />
                              )}
                              {space.name}
                            </div>
                          </TableCell>
                          <TableCell>{space.slug}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {space.type || "General"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>
                    Real-time feed of space events
                  </CardDescription>
                </div>
                <Select
                  value={activityFilter}
                  onValueChange={setActivityFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="post_created">Posts</SelectItem>
                    <SelectItem value="user_joined">Users</SelectItem>
                    <SelectItem value="community_created">
                      Communities
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {loadingActivities ? (
                  <Skeleton className="h-40 w-full" />
                ) : activities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No activities found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity: ActivityItem) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`p-2 rounded-md ${getActivityColor(activity.activity_type)}`}
                        >
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            {activity.actor_name && (
                              <span>{activity.actor_name}</span>
                            )}
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(
                                new Date(activity.created_at),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>
                  Topics currently trending in this space
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTrending ? (
                  <Skeleton className="h-40 w-full" />
                ) : !trendingTopics?.length ? (
                  <p className="text-center text-muted-foreground py-8">
                    No trending topics.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trendingTopics.map((topic: any) => (
                        <TableRow key={topic.id}>
                          <TableCell className="font-medium">
                            {topic.topic}
                          </TableCell>
                          <TableCell>{topic.count}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Trending Topic?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove "{topic.topic}" from
                                    trending list. It will naturally reappear if
                                    it trends again.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() =>
                                      deleteTrendingMutation.mutate(topic.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setAddDepartmentModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Department
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>
                  Manage academic and administrative departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDepartments ? (
                  <Skeleton className="h-40 w-full" />
                ) : !departments?.length ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No departments found.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((dept: any) => (
                        <TableRow key={dept.id}>
                          <TableCell className="font-medium">
                            {dept.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                dept.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {dept.status || "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Department?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <strong>{dept.name}</strong>? This action
                                    cannot be undone and may affect associated
                                    data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() =>
                                      deleteDepartmentMutation.mutate(dept.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="highlights" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setCreateHighlightModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Highlight
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Campus Highlights</CardTitle>
                <CardDescription>
                  Curated or algorithmically selected highlights for the campus.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHighlights ? (
                  <Skeleton className="h-40 w-full" />
                ) : !highlights?.length ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No highlights active.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Highlights are refreshed every 6 hours based on
                      engagement.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {highlights.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {item.display_order}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={item.author_avatar} />
                            <AvatarFallback>
                              {item.author_username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {item.post_content || "Post Content"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by @{item.author_username}
                            </p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove Highlight?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the post from campus
                                highlights.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() =>
                                  deleteHighlightMutation.mutate(item.id)
                                }
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedSpaceId && (
          <AddDepartmentModal
            open={addDepartmentModalOpen}
            onOpenChange={setAddDepartmentModalOpen}
            spaceId={selectedSpaceId}
          />
        )}
      </div>

      <CreateSpaceModal
        open={createSpaceModalOpen}
        onOpenChange={setCreateSpaceModalOpen}
      />

      <CreateHighlightModal
        isOpen={createHighlightModalOpen}
        onOpenChange={setCreateHighlightModalOpen}
        spaceId={selectedSpaceId || ""}
      />
    </AdminPageLayout>
  );
};

export default SpaceActivities;
