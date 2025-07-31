
import { Settings, Search, Heart, Star, MessageCircle, Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { mockTrendingTopics, mockCampusHighlights } from '@/data/mockData';

const notifications = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Max + VOAO',
      username: 'maxvoao',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    action: 'liked 1 of your posts',
    content: 'Want a school website that\'s fast, modern & mobile-friendly?\nWe build beautiful sites that actually work. 🏫✨\nVisit us at: vysionlabs.com\nCall: +233 50 993 4695\n#WebDesign #GhanaTech #VysionLabs #EduTech #DigitalSchools\npic.x.com/dNQrytESsk',
    time: 'Jul 29',
    icon: Heart,
    iconColor: 'text-interaction-like'
  },
  {
    id: '2',
    type: 'mention',
    user: {
      name: 'mr gaping asshole',
      username: 'mrgaping',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    action: 'mentioned you',
    content: '?',
    time: 'Jul 29',
    icon: Star,
    iconColor: 'text-campus-purple'
  },
  {
    id: '3',
    type: 'follow',
    user: {
      name: 'Albert Nat HYDE',
      username: 'albertnathyde',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    action: 'started following you',
    content: 'Kwadwo Sheldon secretly married in 2024, reportedly due to his partner\'s pregnancy then, keeping the event private to avoid online attention. The couple welcomed a child in the US, where his wife resides. His US visits are primarily to spend time with his wife and son. No news!',
    time: 'Jul 23',
    icon: Star,
    iconColor: 'text-campus-purple'
  }
];

const Notifications = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <Sidebar activeTab="notifications" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 border-r border-border">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-bold">Notifications</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Search className="h-5 w-5" />
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
                    const IconComponent = notification.icon;
                    return (
                      <div key={notification.id} className="p-4 hover:bg-hover cursor-pointer transition-colors">
                        <div className="flex space-x-3">
                          <div className="flex flex-col items-center">
                            <div className={`p-2 ${notification.iconColor}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2 mb-1">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={notification.user.avatar} />
                                  <AvatarFallback>
                                    {notification.user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex items-center space-x-1">
                                  <span className="font-bold text-foreground">{notification.user.name}</span>
                                  {notification.user.verified && (
                                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-primary-foreground text-xs">✓</span>
                                    </div>
                                  )}
                                  <span className="text-muted-foreground">{notification.action}</span>
                                </div>
                              </div>
                              
                              <span className="text-sm text-muted-foreground flex-shrink-0">
                                {notification.time}
                              </span>
                            </div>
                            
                            {notification.content && (
                              <div className="mt-2 text-muted-foreground text-sm bg-muted rounded-lg p-3">
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
                    const IconComponent = notification.icon;
                    return (
                      <div key={notification.id} className="p-4 hover:bg-hover cursor-pointer transition-colors">
                        <div className="flex space-x-3">
                          <div className={`p-2 ${notification.iconColor}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={notification.user.avatar} />
                                <AvatarFallback>
                                  {notification.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex items-center space-x-1">
                                <span className="font-bold text-foreground">{notification.user.name}</span>
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
                    const IconComponent = notification.icon;
                    return (
                      <div key={notification.id} className="p-4 hover:bg-hover cursor-pointer transition-colors">
                        <div className="flex space-x-3">
                          <div className={`p-2 ${notification.iconColor}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={notification.user.avatar} />
                                <AvatarFallback>
                                  {notification.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex items-center space-x-1">
                                <span className="font-bold text-foreground">{notification.user.name}</span>
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
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden xl:block">
          <RightSidebar 
            trendingTopics={mockTrendingTopics}
            campusHighlights={mockCampusHighlights}
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
