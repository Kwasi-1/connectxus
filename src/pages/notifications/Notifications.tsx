
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { NotificationTab } from '@/types/global';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock notifications data
        const mockNotifications = [
          {
            id: '1',
            type: 'like' as const,
            user: 'Sarah Johnson',
            action: 'liked your post',
            time: '2h',
            content: 'Great insights on machine learning!',
          },
          {
            id: '2',
            type: 'follow' as const,
            user: 'Mike Chen',
            action: 'started following you',
            time: '4h',
          },
          {
            id: '3',
            type: 'comment' as const,
            user: 'Emma Davis',
            action: 'commented on your post',
            time: '6h',
            content: 'Thanks for sharing this!',
          },
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="border-r border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as NotificationTab)}>
            <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
              <TabsTrigger 
                value="all" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="verified" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Verified
              </TabsTrigger>
              <TabsTrigger 
                value="mentions" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Mentions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="font-semibold text-xs">
                          {notification.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-foreground">{notification.user}</span>
                          <span className="text-muted-foreground">{notification.action}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{notification.time}</span>
                        </div>
                        {notification.content && (
                          <p className="text-muted-foreground mt-1">{notification.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="verified" className="mt-0">
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No verified notifications yet</p>
              </div>
            </TabsContent>
            
            <TabsContent value="mentions" className="mt-0">
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No mentions yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;
