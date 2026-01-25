import React from "react";
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
  UserPlus,
  MessageSquare,
  Shield,
  BarChart3,
  Settings,
} from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { adminApi } from "@/api/admin.api";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  const [currentSpaceId, setCurrentSpaceId] = React.useState<string>(() => {
    return localStorage.getItem("admin-current-space-id") || "";
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const newSpaceId = localStorage.getItem("admin-current-space-id") || "";
      setCurrentSpaceId(newSpaceId);
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", currentSpaceId],
    queryFn: () => adminApi.getDashboardStats(currentSpaceId),
    enabled: !!currentSpaceId,
    staleTime: 30000,
  });

  const { data: spacesData } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => adminApi.getSpaces(),
    staleTime: 5 * 60 * 1000,
  });

  const spaces = spacesData?.spaces || [];

  const currentSpace = React.useMemo(() => {
    if (currentSpaceId === "all") return { name: "All Spaces" };
    return spaces.find((s: any) => s.id === currentSpaceId);
  }, [spaces, currentSpaceId]);

  const quickStats = [
    {
      title: "Total Users",
      value: stats?.total_users?.toLocaleString() || "0",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-950",
      trend: "+12% from last month",
    },
    {
      title: "New Users (30d)",
      value: stats?.new_users_month?.toLocaleString() || "0",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-950",
      trend: "+5% from last month",
    },
    {
      title: "Active Posts",
      value: stats?.total_posts?.toLocaleString() || "0",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-950",
      trend: "+23% from last month",
    },
    {
      title: "Pending Reports",
      value: stats?.pending_reports?.toString() || "0",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-950",
      trend: stats?.pending_reports > 0 ? "Requires attention" : "All clear",
      alert: stats?.pending_reports > 0,
    },
    {
      title: "Communities",
      value: stats?.total_communities?.toString() || "0",
      icon: Building2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      darkBgColor: "dark:bg-indigo-950",
      trend: "+8% from last month",
    },
    {
      title: "Groups",
      value: stats?.total_groups?.toString() || "0",
      icon: MessageSquare,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      darkBgColor: "dark:bg-teal-950",
      trend: "+15% from last month",
    },
    {
      title: "Suspensions (30d)",
      value: stats?.suspensions_month?.toString() || "0",
      icon: Shield,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      darkBgColor: "dark:bg-orange-950",
      trend: stats?.suspensions_month > 5 ? "Higher than usual" : "Normal range",
      alert: stats?.suspensions_month > 5,
    },
    {
      title: "Total Spaces",
      value: spaces.length.toString(),
      icon: Building2,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      darkBgColor: "dark:bg-cyan-950",
      trend: `${spaces.length} space${spaces.length !== 1 ? "s" : ""} configured`,
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View, edit, and manage user accounts",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-950",
    },
    {
      title: "Content Reports",
      description: "Review and moderate reported content",
      icon: AlertTriangle,
      href: "/admin/reports",
      color: "text-red-600",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-950",
      badge: stats?.pending_reports > 0 ? stats.pending_reports : undefined,
    },
    {
      title: "Communities",
      description: "Manage communities and groups",
      icon: Building2,
      href: "/admin/communities",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-950",
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      darkBgColor: "dark:bg-gray-950",
    },
    {
      title: "Space Activities",
      description: "View recent space activity logs",
      icon: Activity,
      href: "/admin/activities",
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-950",
    },
    {
      title: "Admin Management",
      description: "Manage administrator accounts",
      icon: Shield,
      href: "/admin/admins",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      darkBgColor: "dark:bg-orange-950",
    },
  ];

  if (!currentSpaceId) {
    return (
      <AdminPageLayout title="Admin Dashboard">
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Space</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Please select a space from the space switcher to view dashboard statistics.
            </p>
          </CardContent>
        </Card>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Admin Dashboard">
      <div className="space-y-6">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {currentSpace?.name || "Unknown Space"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dashboard Overview
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <Card
              key={stat.title}
              className={`transition-all hover:shadow-md ${
                stat.alert ? "border-red-200 dark:border-red-900" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} ${stat.darkBgColor}`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p
                      className={`text-xs mt-1 ${
                        stat.alert
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.trend}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                >
                  Operational
                </Badge>
                <span className="text-sm text-muted-foreground">
                  All systems running smoothly
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Access frequently used features and tools
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${action.bgColor} ${action.darkBgColor}`}>
                          <action.icon className={`h-5 w-5 ${action.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{action.title}</h4>
                            {action.badge && (
                              <Badge variant="destructive" className="text-xs">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}

export default AdminDashboard;
