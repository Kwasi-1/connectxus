import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity,
  Building2,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { SpaceSwitcher } from "@/components/admin/SpaceSwitcher";
import { CreateSpaceModal } from "@/components/admin/CreateSpaceModal";
import { adminApi } from "@/api/admin.api";
import { toast } from "sonner";

export function AdminDashboard() {
  const { admin, hasPermission } = useAdminAuth();
  const [currentSpaceId, setCurrentSpaceId] = useState<string>("");
  const [createSpaceModalOpen, setCreateSpaceModalOpen] = useState(false);

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: adminApi.getSpaces,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (spaces.length > 0 && !currentSpaceId) {
      setCurrentSpaceId(spaces[0].id);
    }
  }, [spaces, currentSpaceId]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", currentSpaceId],
    queryFn: () => adminApi.getDashboardStats(currentSpaceId),
    enabled: !!currentSpaceId,
    staleTime: 60000,
  });

  const quickStats = [
    {
      title: "Total Users",
      value: stats?.total_users.toLocaleString() || "0",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      permission: "user_management",
    },
    {
      title: "New Users (Month)",
      value: stats?.new_users_month.toLocaleString() || "0",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      permission: "analytics",
    },
    {
      title: "Total Posts",
      value: stats?.total_posts.toLocaleString() || "0",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      permission: "content_management",
    },
    {
      title: "Pending Reports",
      value: stats?.pending_reports.toString() || "0",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-600/10",
      permission: "content_management",
    },
    {
      title: "Suspensions (Month)",
      value: stats?.suspensions_month.toString() || "0",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-600/10",
      permission: "user_management",
    },
    {
      title: "Communities",
      value: stats?.total_communities.toString() || "0",
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
      permission: "community_management",
    },
  ];

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

  return (
    <AdminPageLayout title="Admin Dashboard">
      <div className="space-y-4">
        {currentSpaceId && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickStats.map((stat, index) => {
                if (!hasPermission(stat.permission as any)) return null;

                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div
                        className={`p-3 rounded-xl ${
                          stat.bgColor
                        } bg-gradient-to-br from-${stat.color.replace(
                          "text-",
                          ""
                        )}/20 to-${stat.color.replace(
                          "text-",
                          ""
                        )}/5 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-10 w-24" />
                      ) : (
                        <div className="space-y-1">
                          <div className="text-3xl font-bold tracking-tight">
                            {stat.value}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Updated just now
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* System Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                      >
                        Operational
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        All systems are running smoothly
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Access frequently used features
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {hasPermission("user_management") && (
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 hover:scale-105 transition-all duration-200 group"
                      asChild
                    >
                      <a href="/admin/users">
                        <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Manage Users</span>
                      </a>
                    </Button>
                  )}
                  {hasPermission("content_management") && (
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 hover:scale-105 transition-all duration-200 group"
                      asChild
                    >
                      <a href="/admin/reports">
                        <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-medium">View Reports</span>
                      </a>
                    </Button>
                  )}
                  {hasPermission("community_management") && (
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 hover:scale-105 transition-all duration-200 group"
                      asChild
                    >
                      <a href="/admin/communities">
                        <Building2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Manage Communities</span>
                      </a>
                    </Button>
                  )}
                  {hasPermission("analytics") && (
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 hover:scale-105 transition-all duration-200 group"
                      asChild
                    >
                      <a href="/admin/analytics">
                        <Activity className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-medium">View Analytics</span>
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <CreateSpaceModal
          open={createSpaceModalOpen}
          onOpenChange={setCreateSpaceModalOpen}
          onSuccess={handleSpaceCreated}
        />
      </div>
    </AdminPageLayout>
  );
}

export default AdminDashboard;
