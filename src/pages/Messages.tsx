
import { Settings, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar } from '@/components/layout/Sidebar';

const conversations = [
  {
    id: '1',
    user: {
      name: 'the man',
      username: 'theman218767454',
      avatar: '/api/placeholder/40/40'
    },
    lastMessage: 'hi',
    time: '34m',
    unread: false
  }
];

const Messages = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <Sidebar activeTab="messages" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 border-r border-border">
          {/* Messages Sidebar */}
          <div className="w-80 border-r border-border h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border">
              <div className="flex items-center justify-between p-4">
                <h1 className="text-xl font-bold">Messages</h1>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Mail className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Search */}
              <div className="p-4 pt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search Direct Messages" 
                    className="pl-10 bg-muted border-none rounded-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Conversations */}
            <div className="divide-y divide-border">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="p-4 hover:bg-hover cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>
                        {conversation.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground truncate">
                            {conversation.user.name}
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
              <p className="text-muted-foreground mb-6">
                Choose from your existing conversations, start a new one, or just keep swimming.
              </p>
              
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full px-8 py-3">
                New message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
