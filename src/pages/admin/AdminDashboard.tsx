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
    <AdminPageLayout
      title="Admin Dashboard"
      description="Overview of system metrics and activities"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Current Space</CardTitle>
              </div>
              <SpaceSwitcher
                currentSpaceId={currentSpaceId}
                onSpaceChange={handleSpaceChange}
                onCreateSpace={handleCreateSpace}
              />
            </div>
          </CardHeader>
        </Card>

        {currentSpaceId && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickStats.map((stat, index) => {
                if (!hasPermission(stat.permission as any)) return null;

                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <div className="text-2xl font-bold">{stat.value}</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    All systems are running smoothly
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {hasPermission("user_management") && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/admin/users">Manage Users</a>
                    </Button>
                  )}
                  {hasPermission("content_management") && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/admin/reports">View Reports</a>
                    </Button>
                  )}
                  {hasPermission("community_management") && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/admin/communities">Manage Communities</a>
                    </Button>
                  )}
                  {hasPermission("analytics") && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/admin/analytics">View Analytics</a>
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
