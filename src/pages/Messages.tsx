
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Search, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const mockConversations = [
    {
      id: '1',
      user: 'Sarah Johnson',
      lastMessage: 'Thanks for the study notes!',
      time: '2m',
      unread: true,
    },
    {
      id: '2',
      user: 'Study Group',
      lastMessage: 'Meeting at 3 PM today',
      time: '1h',
      unread: false,
    },
    {
      id: '3',
      user: 'Mike Chen',
      lastMessage: 'See you at the library',
      time: '3h',
      unread: false,
    },
  ];

  return (
    <AppLayout showRightSidebar={false}>
      <div className="flex h-screen">
        {/* Messages Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search Direct Messages" 
                className="pl-10 py-3 bg-muted border-none rounded-full"
              />
            </div>
          </div>
          
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 ${
                  selectedConversation === conversation.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <span className="font-semibold">
                      {conversation.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground truncate">{conversation.user}</h3>
                      <span className="text-sm text-muted-foreground">{conversation.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Message View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">
                  {mockConversations.find(c => c.id === selectedConversation)?.user}
                </h2>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4">
                <div className="text-center text-muted-foreground">
                  Start of your conversation with {mockConversations.find(c => c.id === selectedConversation)?.user}
                </div>
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <Input 
                  placeholder="Start a new message"
                  className="w-full py-3 rounded-full"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Select a message</h3>
                <p className="text-muted-foreground">Choose from your existing conversations or start a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;
