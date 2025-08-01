
import { Settings, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';
import type { Conversation } from '@/types/global.d';

const conversations: Conversation[] = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'the man',
      username: 'theman218767454',
      displayName: 'the man',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    lastMessage: 'hi',
    time: '34m',
    unread: false
  }
];

const Messages = () => {
  return (
    <AppLayout activeTab="messages" showRightSidebar={false}>
      <div className="flex h-screen">
        {/* Messages Sidebar */}
        <div className="w-80 border-r border-border h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-bold">Messages</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="p-4 pt-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search Direct Messages" 
                  className="pl-12 bg-muted border-none rounded-full h-10"
                />
              </div>
            </div>
          </div>
          
          {/* Conversations */}
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.user.avatar} />
                    <AvatarFallback>
                      {conversation.user.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="font-bold text-foreground truncate">
                          {conversation.user.displayName}
                        </span>
                        <span className="text-muted-foreground text-sm truncate">
                          @{conversation.user.username}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm flex-shrink-0">
                        {conversation.time}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Message View */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold text-foreground mb-4">Select a message</h2>
            <p className="text-muted-foreground mb-6 text-base">
              Choose from your existing conversations, start a new one, or just keep swimming.
            </p>
            
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3">
              New message
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;
