import { Settings, Search, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';
import type { Notification } from '@/types/global.d';

const notifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      id: '1',
      username: 'maxvoao',
      displayName: 'Max + VOAO',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    action: 'liked 1 of your posts',
    content: 'Want a school website that\'s fast, modern & mobile-friendly?\nWe build beautiful sites that actually work. 🏫✨',
    time: 'Jul 29',
    read: false
  },
  {
    id: '2',
    type: 'mention',
    user: {
      id: '2',
      username: 'mrgaping',
      displayName: 'mr gaping asshole',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    action: 'mentioned you',
    content: '?',
    time: 'Jul 29',
    read: false
  },
  {
    id: '3',
    type: 'follow',
    user: {
      id: '3',
      username: 'albertnathyde',
      displayName: 'Albert Nat HYDE',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    action: 'started following you',
    content: 'Kwadwo Sheldon secretly married in 2024, reportedly due to his partner\'s pregnancy...',
    time: 'Jul 23',
    read: true
  }
];

const Notifications = () => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return Heart;
      default:
        return Star;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'text-red-500';
      default:
        return 'text-primary';
    }
  };

  return (
    <AppLayout activeTab="notifications">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Notifications</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full bg-transparent h-auto p-0 border-b border-border rounded-none">
            <TabsTrigger 
              value="all" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-medium"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="verified" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-medium"
            >
              Verified
            </TabsTrigger>
            <TabsTrigger 
              value="mentions" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-medium"
            >
              Mentions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getIconColor(notification.type);
                
                return (
                  <div key={notification.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex space-x-3">
                      <div className="flex flex-col items-center pt-1">
                        <div className={`p-2 ${iconColor}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-2 min-w-0">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={notification.user.avatar} />
                              <AvatarFallback>
                                {notification.user.displayName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex items-center space-x-1 min-w-0">
                              <span className="font-bold text-foreground truncate">{notification.user.displayName}</span>
                              {notification.user.verified && (
                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary-foreground text-xs">✓</span>
                                </div>
                              )}
                              <span className="text-muted-foreground text-sm">{notification.action}</span>
                            </div>
                          </div>
                          
                          <span className="text-sm text-muted-foreground flex-shrink-0 ml-2">
                            {notification.time}
                          </span>
                        </div>
                        
                        {notification.content && (
                          <div className="mt-2 text-muted-foreground text-sm bg-muted/30 rounded-lg p-3">
                            {notification.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="verified">
            <div className="divide-y divide-border">
              {notifications.filter(n => n.user.verified).map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getIconColor(notification.type);
                
                return (
                  <div key={notification.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex space-x-3">
                      <div className={`p-2 ${iconColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.user.avatar} />
                            <AvatarFallback>
                              {notification.user.displayName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-foreground">{notification.user.displayName}</span>
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs">✓</span>
                            </div>
                            <span className="text-muted-foreground">{notification.action}</span>
                          </div>
                          
                          <span className="text-sm text-muted-foreground ml-auto">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="mentions">
            <div className="divide-y divide-border">
              {notifications.filter(n => n.type === 'mention').map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getIconColor(notification.type);
                
                return (
                  <div key={notification.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex space-x-3">
                      <div className={`p-2 ${iconColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.user.avatar} />
                            <AvatarFallback>
                              {notification.user.displayName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-foreground">{notification.user.displayName}</span>
                            <span className="text-muted-foreground">@{notification.user.username}</span>
                            <span className="text-muted-foreground">mentioned you</span>
                          </div>
                          
                          <span className="text-sm text-muted-foreground ml-auto">
                            {notification.time}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-foreground">
                          {notification.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Notifications;
