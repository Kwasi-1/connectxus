import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  Trash2,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminNotification } from "@/types/admin";
import { adminApi } from "@/api/admin.api";

export function Notifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getNotifications(
        undefined,
        undefined,
        undefined,
        page,
        50,
      );

      const transformedNotifications: AdminNotification[] = (
        data.notifications || []
      ).map((item: any) => ({
        id: item.id,
        type: item.type || "system",
        title: item.title,
        message: item.content,
        priority: item.priority || "low",
        isRead: item.is_read || false,
        actionRequired: item.action_url ? true : false,
        relatedId: item.related_id,
        createdAt: new Date(item.created_at),
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await adminApi.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
      toast({
        title: "All notifications marked as read",
        description: "Your notification center has been updated.",
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await adminApi.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId),
      );
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await Promise.all(
        notifications.map((n) => adminApi.deleteNotification(n.id)),
      );
      setNotifications([]);
      toast({
        title: "All notifications cleared",
        description: "Your notification center is now empty.",
      });
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear all notifications.",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "report":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "application":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "system":
        return <Settings className="h-5 w-5 text-purple-600" />;
      case "user_activity":
        return <Users className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-600 text-white">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-600 text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600 text-white">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const actionRequiredCount = notifications.filter(
    (n) => n.actionRequired && !n.isRead,
  ).length;

  const filteredNotifications = (filter: string) => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "action":
        return notifications.filter((n) => n.actionRequired);
      case "reports":
        return notifications.filter((n) => n.type === "report");
      case "applications":
        return notifications.filter((n) => n.type === "application");
      default:
        return notifications;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">Notifications</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold custom-font">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Action Required
            </CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionRequiredCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="action">Action Required</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            {(
              ["all", "unread", "action", "reports", "applications"] as const
            ).map((filter) => (
              <TabsContent key={filter} value={filter} className="mt-4">
                <div className="space-y-3">
                  {filteredNotifications(filter).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications in this category</p>
                    </div>
                  ) : (
                    filteredNotifications(filter).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.isRead
                            ? "bg-background border-border"
                            : "bg-muted/30 border-primary/20"
                        }`}
                      >
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3
                                  className={`font-medium ${
                                    notification.isRead
                                      ? "text-foreground"
                                      : "text-foreground font-semibold"
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center space-x-2">
                                {getPriorityBadge(notification.priority)}
                                {notification.actionRequired && (
                                  <Badge
                                    variant="outline"
                                    className="text-orange-600 border-orange-600"
                                  >
                                    Action Required
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {getTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
