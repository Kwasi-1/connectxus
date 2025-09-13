import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface SystemSetting {
  key: string;
  value: string | boolean;
  type: 'text' | 'boolean' | 'number' | 'textarea' | 'select';
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

  // Only super admins can access this page
  if (!hasRole('super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need Super Admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Mock settings data loading
    setTimeout(() => {
      const mockSettings: SystemSetting[] = [
        // General Settings
        {
          key: 'app_name',
          value: 'Connect - University Social Network',
          type: 'text',
          category: 'general',
          label: 'Application Name',
          description: 'The name of your application'
        },
        {
          key: 'app_description',
          value: 'Connect students, tutors, and mentors on campus',
          type: 'textarea',
          category: 'general',
          label: 'Application Description',
          description: 'Brief description of your application'
        },
        {
          key: 'university_name',
          value: 'University of Ghana',
          type: 'text',
          category: 'general',
          label: 'University Name',
          description: 'Name of the university'
        },
        {
          key: 'maintenance_mode',
          value: false,
          type: 'boolean',
          category: 'general',
          label: 'Maintenance Mode',
          description: 'Enable maintenance mode to prevent user access'
        },
        
        // User Settings
        {
          key: 'user_registration',
          value: true,
          type: 'boolean',
          category: 'users',
          label: 'Allow User Registration',
          description: 'Allow new users to register accounts'
        },
        {
          key: 'email_verification',
          value: true,
          type: 'boolean',
          category: 'users',
          label: 'Require Email Verification',
          description: 'Require users to verify their email addresses'
        },
        {
          key: 'max_file_size',
          value: '10',
          type: 'number',
          category: 'users',
          label: 'Max File Upload Size (MB)',
          description: 'Maximum file size for user uploads'
        },
        
        // Content Settings
        {
          key: 'post_moderation',
          value: false,
          type: 'boolean',
          category: 'content',
          label: 'Post Moderation',
          description: 'Require admin approval for all posts'
        },
        {
          key: 'auto_delete_reported',
          value: false,
          type: 'boolean',
          category: 'content',
          label: 'Auto-delete Reported Content',
          description: 'Automatically remove content after multiple reports'
        },
        {
          key: 'content_language',
          value: 'en',
          type: 'select',
          category: 'content',
          label: 'Default Content Language',
          description: 'Default language for content moderation',
          options: ['en', 'fr', 'es', 'de']
        },
        
        // Notifications
        {
          key: 'email_notifications',
          value: true,
          type: 'boolean',
          category: 'notifications',
          label: 'Email Notifications',
          description: 'Send email notifications to users'
        },
        {
          key: 'push_notifications',
          value: true,
          type: 'boolean',
          category: 'notifications',
          label: 'Push Notifications',
          description: 'Send push notifications to mobile apps'
        },
        {
          key: 'admin_notifications',
          value: true,
          type: 'boolean',
          category: 'notifications',
          label: 'Admin Notifications',
          description: 'Send notifications to administrators'
        },
        
        // Security
        {
          key: 'session_timeout',
          value: '24',
          type: 'number',
          category: 'security',
          label: 'Session Timeout (hours)',
          description: 'Automatic logout after inactivity'
        },
        {
          key: 'password_strength',
          value: 'medium',
          type: 'select',
          category: 'security',
          label: 'Password Strength Requirements',
          description: 'Minimum password strength requirements',
          options: ['low', 'medium', 'high']
        },
        {
          key: 'two_factor_auth',
          value: false,
          type: 'boolean',
          category: 'security',
          label: 'Two-Factor Authentication',
          description: 'Enable 2FA for all users'
        }
      ];
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully."
    });
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category);
  };

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={setting.type}
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="max-w-md"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="max-w-md"
            rows={3}
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={setting.value as boolean}
            onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
          />
        );
      
      case 'select':
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
      case 'general':
        return <Settings className="h-5 w-5" />;
      case 'users':
        return <Shield className="h-5 w-5" />;
      case 'content':
        return <Globe className="h-5 w-5" />;
      case 'notifications':
        return <Bell className="h-5 w-5" />;
      case 'security':
        return <Key className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const systemStatus = [
    {
      component: 'Database',
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: '2 min ago'
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
    },
    {
      component: 'Backup System',
      status: 'healthy',
      uptime: '100%',
      lastCheck: '5 min ago'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">System Settings</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={isSaving}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* System Status */}
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
                  <span className="font-medium text-sm">{system.component}</span>
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

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            {(['general', 'users', 'content', 'notifications', 'security'] as const).map((category) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    {getCategoryIcon(category)}
                    <h3 className="text-lg font-semibold capitalize">{category} Settings</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {getSettingsByCategory(category).map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                        <div className="flex-1 pr-4">
                          <Label className="text-sm font-medium">{setting.label}</Label>
                          <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
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

      {/* Danger Zone */}
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
              <p className="text-sm text-muted-foreground">Permanently delete all user accounts and data</p>
            </div>
            <Button variant="destructive" size="sm">
              Clear Data
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <Label className="text-sm font-medium">Reset System Settings</Label>
              <p className="text-sm text-muted-foreground">Reset all settings to factory defaults</p>
            </div>
            <Button variant="destructive" size="sm">
              Reset Settings
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="text-sm font-medium">Export System Data</Label>
              <p className="text-sm text-muted-foreground">Download a backup of all system data</p>
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