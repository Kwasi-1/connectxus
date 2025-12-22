import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Mail,
  Bell,
  Palette,
  Shield,
  Globe,
  Key,
  Upload,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminApi } from "@/api/admin.api";
interface SystemSetting {
  key: string;
  value: string | boolean;
  type: "text" | "boolean" | "number" | "textarea" | "select";
  category: string;
  label: string;
  description: string;
  options?: string[];
}

export function SystemSettings() {
  const { toast } = useToast();
  const { hasRole } = useAdminAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modifiedSettings, setModifiedSettings] = useState<Set<string>>(
    new Set()
  );

  if (!hasRole("super_admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You need Super Admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getSettings();

      const transformedSettings: SystemSetting[] = data.map((item: any) => {
        let value = item.value;
        let type: SystemSetting["type"] = "text";

        try {
          const parsed = JSON.parse(item.value);
          if (typeof parsed === "boolean") {
            value = parsed;
            type = "boolean";
          } else if (typeof parsed === "number") {
            value = parsed.toString();
            type = "number";
          } else {
            value = parsed;
          }
        } catch {
          value = item.value;
        }

        const category = item.key.includes("user_")
          ? "users"
          : item.key.includes("email_") ||
            item.key.includes("push_") ||
            item.key.includes("notification")
          ? "notifications"
          : item.key.includes("password_") ||
            item.key.includes("session_") ||
            item.key.includes("auth")
          ? "security"
          : item.key.includes("post_") || item.key.includes("content_")
          ? "content"
          : "general";

        return {
          key: item.key,
          value,
          type,
          category,
          label: item.key
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          description: item.description || `Configure ${item.key} setting`,
        };
      });

      setSettings(transformedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast({
        title: "Error",
        description: "Failed to load system settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.key === key ? { ...setting, value } : setting
      )
    );
    setModifiedSettings((prev) => new Set(prev).add(key));
  };

  const handleSaveSettings = async () => {
    if (modifiedSettings.size === 0) {
      toast({
        title: "No Changes",
        description: "No settings have been modified.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const savePromises = Array.from(modifiedSettings).map((key) => {
        const setting = settings.find((s) => s.key === key);
        if (setting) {
          return adminApi.updateSetting(
            key,
            setting.value,
            setting.description
          );
        }
        return Promise.resolve();
      });

      await Promise.all(savePromises);

      setModifiedSettings(new Set());
      toast({
        title: "Settings Saved",
        description: `Successfully updated ${modifiedSettings.size} setting(s).`,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter((setting) => setting.category === category);
  };

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case "text":
      case "number":
        return (
          <Input
            type={setting.type}
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="max-w-md"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="max-w-md"
            rows={3}
          />
        );

      case "boolean":
        return (
          <Switch
            checked={setting.value as boolean}
            onCheckedChange={(checked) =>
              handleSettingChange(setting.key, checked)
            }
          />
        );

      case "select":
        return (
          <Select
            value={setting.value as string}
            onValueChange={(value) => handleSettingChange(setting.key, value)}
          >
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "general":
        return <Settings className="h-5 w-5" />;
      case "users":
        return <Shield className="h-5 w-5" />;
      case "content":
        return <Globe className="h-5 w-5" />;
      case "notifications":
        return <Bell className="h-5 w-5" />;
      case "security":
        return <Key className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const systemStatus = [
    {
      component: "Database",
      status: "healthy",
      uptime: "99.9%",
      lastCheck: "2 min ago",
    },
    {
      component: "File Storage",
      status: "warning",
      uptime: "97.2%",
      lastCheck: "30 sec ago",
    },
    {
      component: "Email Service",
      status: "healthy",
      uptime: "99.7%",
      lastCheck: "1 min ago",
    },
    {
      component: "Backup System",
      status: "healthy",
      uptime: "100%",
      lastCheck: "5 min ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-600/10";
      case "warning":
        return "text-orange-600 bg-orange-600/10";
      case "critical":
        return "text-red-600 bg-red-600/10";
      default:
        return "text-gray-600 bg-gray-600/10";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">System Settings</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold custom-font">System Settings</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={isSaving}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSaving ? "animate-spin" : ""}`}
            />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStatus.map((system) => (
              <div key={system.component} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {system.component}
                  </span>
                  <Badge className={getStatusColor(system.status)}>
                    {system.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Uptime: {system.uptime}</div>
                  <div>Last check: {system.lastCheck}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger
                value="general"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="flex items-center space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center space-x-2"
              >
                <Key className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            {(
              [
                "general",
                "users",
                "content",
                "notifications",
                "security",
              ] as const
            ).map((category) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    {getCategoryIcon(category)}
                    <h3 className="text-lg font-semibold capitalize">
                      {category} Settings
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {getSettingsByCategory(category).map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between py-4 border-b border-border last:border-b-0"
                      >
                        <div className="flex-1 pr-4">
                          <Label className="text-sm font-medium">
                            {setting.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {setting.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {renderSettingInput(setting)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <Label className="text-sm font-medium">Clear All User Data</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all user accounts and data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Clear Data
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <Label className="text-sm font-medium">
                Reset System Settings
              </Label>
              <p className="text-sm text-muted-foreground">
                Reset all settings to factory defaults
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Reset Settings
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="text-sm font-medium">Export System Data</Label>
              <p className="text-sm text-muted-foreground">
                Download a backup of all system data
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
