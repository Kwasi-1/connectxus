import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  GraduationCap, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Activity
} from 'lucide-react';
import { SystemMetrics } from '@/types/admin';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function AdminDashboard() {
  const { admin, hasPermission } = useAdminAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock loading metrics
    setTimeout(() => {
      setMetrics({
        totalUsers: 15247,
        activeUsers: 8932,
        totalPosts: 45621,
        totalGroups: 342,
        totalEvents: 127,
        reportedContent: 23,
        pendingApplications: 47,
        systemHealth: 'good',
        lastUpdated: new Date()
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const quickStats = [
    {
      title: 'Total Users',
      value: metrics?.totalUsers.toLocaleString() || '0',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      permission: 'user_management'
    },
    {
      title: 'Active Today',
      value: metrics?.activeUsers.toLocaleString() || '0',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
      permission: 'analytics'
    },
    {
      title: 'Total Posts',
      value: metrics?.totalPosts.toLocaleString() || '0',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      permission: 'content_management'
    },
    {
      title: 'Reported Content',
      value: metrics?.reportedContent.toString() || '0',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-600/10',
      permission: 'content_management'
    },
    {
      title: 'Pending Applications',
      value: metrics?.pendingApplications.toString() || '0',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600/10',
      permission: 'tutoring_management'
    },
    {
      title: 'Active Groups',
      value: metrics?.totalGroups.toString() || '0',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
      permission: 'community_management'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'user_join',
      message: 'New user registered: Sarah Johnson',
      time: '5 minutes ago',
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'report',
      message: 'Content reported in Computer Science group',
      time: '12 minutes ago',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      id: '3',
      type: 'application',
      message: 'New tutor application for Mathematics',
      time: '1 hour ago',
      icon: GraduationCap,
      color: 'text-blue-600'
    },
    {
      id: '4',
      type: 'content',
      message: 'Campus event created: Tech Fair 2024',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  const systemStatus = [
    {
      component: 'Database',
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: '2 min ago'
    },
    {
      component: 'Authentication',
      status: 'healthy',
      uptime: '100%',
      lastCheck: '1 min ago'
    },
    {
      component: 'File Storage',
      status: 'warning',
      uptime: '97.2%',
      lastCheck: '30 sec ago'
    },
    {
      component: 'Email Service',
      status: 'healthy',
      uptime: '99.7%',
      lastCheck: '1 min ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-600/10';
      case 'warning': return 'text-orange-600 bg-orange-600/10';
      case 'critical': return 'text-red-600 bg-red-600/10';
      default: return 'text-gray-600 bg-gray-600/10';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground custom-font">
            Welcome back, {admin?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with Connect today
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</Badge>
          <Badge className={getStatusColor(metrics?.systemHealth || 'good')}>
            System {metrics?.systemHealth || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickStats.map((stat) => {
          if (stat.permission && !hasPermission(stat.permission as any)) return null;
          
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+5.2% from last week</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${activity.color === 'text-green-600' ? 'bg-green-600/10' : activity.color === 'text-red-600' ? 'bg-red-600/10' : 'bg-blue-600/10'}`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemStatus.map((system) => (
              <div key={system.component} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(system.status)}>
                    {system.status}
                  </Badge>
                  <span className="text-sm font-medium">{system.component}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{system.uptime}</div>
                  <div className="text-xs text-muted-foreground">{system.lastCheck}</div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View System Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hasPermission('content_management') && (
              <Button variant="outline" className="h-20 flex flex-col">
                <AlertTriangle className="h-6 w-6 mb-2" />
                Review Reports
              </Button>
            )}
            {hasPermission('tutoring_management') && (
              <Button variant="outline" className="h-20 flex flex-col">
                <GraduationCap className="h-6 w-6 mb-2" />
                Tutor Applications
              </Button>
            )}
            {hasPermission('user_management') && (
              <Button variant="outline" className="h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                Manage Users
              </Button>
            )}
            {hasPermission('analytics') && (
              <Button variant="outline" className="h-20 flex flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                View Analytics
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}