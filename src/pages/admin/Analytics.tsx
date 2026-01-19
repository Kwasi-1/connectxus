import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Users,
  FileText,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Building2,
  Calendar,
  BarChart3,
  AlertCircle,
  Clock,
  ShieldBan,
  Building,
  Layers,
} from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { adminApi } from "@/api/admin.api";
import { GrowthChart } from "@/components/admin/GrowthChart";
import { DistributionChart } from "@/components/admin/DistributionChart";

export function Analytics() {
  return (
    <AdminPageLayout title="Analytics">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="tutoring" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Tutoring</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Community</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - 4 Key Metrics */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Overview - Key Metrics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Top 4 most important growth indicators
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <GrowthChart
                  title="Active Users Growth"
                  dataKey="active_users"
                  color="#3b82f6"
                  fetchData={adminApi.getActiveUsersGrowth}
                  icon={<Users className="h-5 w-5 text-blue-600" />}
                />

                <GrowthChart
                  title="Tutoring Sessions (Completed)"
                  dataKey="completed_sessions"
                  color="#10b981"
                  fetchData={adminApi.getTutoringCompletedGrowth}
                  icon={<GraduationCap className="h-5 w-5 text-green-600" />}
                />

                <GrowthChart
                  title="Public Posts"
                  dataKey="public_posts"
                  color="#8b5cf6"
                  fetchData={adminApi.getPublicPostsGrowth}
                  icon={<FileText className="h-5 w-5 text-purple-600" />}
                />

                <GrowthChart
                  title="Active Public Communities"
                  dataKey="active_public_communities"
                  color="#6366f1"
                  fetchData={adminApi.getCommunitiesGrowth}
                  icon={<Building2 className="h-5 w-5 text-indigo-600" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track user growth and engagement patterns
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <GrowthChart
                  title="Active Users Growth"
                  dataKey="active_users"
                  color="#3b82f6"
                  fetchData={adminApi.getActiveUsersGrowth}
                  icon={<Users className="h-5 w-5 text-blue-600" />}
                />

                <DistributionChart
                  title="Users by Department"
                  dataKey="user_count"
                  labelKey="department_name"
                  color="#10b981"
                  fetchData={adminApi.getUsersByDepartment}
                  icon={<Building className="h-5 w-5 text-green-600" />}
                />

                <DistributionChart
                  title="Users by Level"
                  dataKey="user_count"
                  labelKey="level"
                  color="#8b5cf6"
                  fetchData={adminApi.getUsersByLevel}
                  icon={<Layers className="h-5 w-5 text-purple-600" />}
                />

                <GrowthChart
                  title="Suspended Users"
                  dataKey="suspended_users"
                  color="#ef4444"
                  fetchData={adminApi.getSuspendedUsersGrowth}
                  icon={<ShieldBan className="h-5 w-5 text-red-600" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutoring Tab */}
        <TabsContent value="tutoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Tutoring Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor tutoring session trends and completion rates
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <GrowthChart
                  title="Tutoring Sessions (Completed)"
                  dataKey="completed_sessions"
                  color="#10b981"
                  fetchData={adminApi.getTutoringCompletedGrowth}
                  icon={<GraduationCap className="h-5 w-5 text-green-600" />}
                />

                <GrowthChart
                  title="Tutoring Sessions (Ongoing)"
                  dataKey="ongoing_sessions"
                  color="#f59e0b"
                  fetchData={adminApi.getTutoringOngoingGrowth}
                  icon={<GraduationCap className="h-5 w-5 text-orange-600" />}
                />

                <GrowthChart
                  title="Refund Requested Sessions"
                  dataKey="refund_requested_sessions"
                  color="#ef4444"
                  fetchData={adminApi.getTutoringRefundRequestedGrowth}
                  icon={<AlertCircle className="h-5 w-5 text-red-600" />}
                />

                <GrowthChart
                  title="Pending Sessions"
                  dataKey="pending_sessions"
                  color="#6366f1"
                  fetchData={adminApi.getTutoringPendingGrowth}
                  icon={<Clock className="h-5 w-5 text-indigo-600" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track content creation including posts and stories
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <GrowthChart
                  title="Public Posts"
                  dataKey="public_posts"
                  color="#8b5cf6"
                  fetchData={adminApi.getPublicPostsGrowth}
                  icon={<FileText className="h-5 w-5 text-purple-600" />}
                />

                <GrowthChart
                  title="Stories"
                  dataKey="active_stories"
                  color="#ec4899"
                  fetchData={adminApi.getStoriesGrowth}
                  icon={<Layers className="h-5 w-5 text-pink-600" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Community Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor community engagement, groups, and events
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <GrowthChart
                  title="Active Public Groups"
                  dataKey="active_public_groups"
                  color="#06b6d4"
                  fetchData={adminApi.getGroupsGrowth}
                  icon={<MessageSquare className="h-5 w-5 text-cyan-600" />}
                />

                <GrowthChart
                  title="Active Public Communities"
                  dataKey="active_public_communities"
                  color="#6366f1"
                  fetchData={adminApi.getCommunitiesGrowth}
                  icon={<Building2 className="h-5 w-5 text-indigo-600" />}
                />

                <GrowthChart
                  title="Published Events"
                  dataKey="published_events"
                  color="#ec4899"
                  fetchData={adminApi.getEventsGrowth}
                  icon={<Calendar className="h-5 w-5 text-pink-600" />}
                />

                <DistributionChart
                  title="Users by Group Type"
                  dataKey="user_count"
                  labelKey="group_type"
                  fetchData={adminApi.getUsersByGroupType}
                  icon={<Users className="h-5 w-5 text-orange-600" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help & Support Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track help requests and support ticket trends
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <GrowthChart
                  title="Help Requests"
                  dataKey="help_requests"
                  color="#ef4444"
                  fetchData={adminApi.getHelpRequestsGrowth}
                  icon={<HelpCircle className="h-5 w-5 text-red-600" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}

export default Analytics;
