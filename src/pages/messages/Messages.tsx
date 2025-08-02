
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Phone, 
  MoreHorizontal, 
  Send, 
  Pin,
  PinOff,
  Trash2,
  MessageSquare,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
  isPinned: boolean;
  phone?: string;
  lastMessageTime: number;
}

const Messages = () => {
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      lastMessage: 'Hey! How\'s the project going?',
      timestamp: '2 min ago',
      unreadCount: 2,
      isOnline: true,
      isPinned: false,
      phone: '+233667788801',
      lastMessageTime: Date.now() - 120000,
      messages: [
        { id: '1', content: 'Hey! How are you?', timestamp: '10:00 AM', isOwn: false },
        { id: '2', content: 'I\'m good! How about you?', timestamp: '10:01 AM', isOwn: true },
        { id: '3', content: 'Great! Working on the new project', timestamp: '10:02 AM', isOwn: false },
        { id: '4', content: 'Hey! How\'s the project going?', timestamp: '10:05 AM', isOwn: false }
      ]
    },
    {
      id: '2',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      lastMessage: 'Thanks for the help!',
      timestamp: '1 hour ago',
      unreadCount: 0,
      isOnline: false,
      isPinned: true,
      phone: '+233667788802',
      lastMessageTime: Date.now() - 3600000,
      messages: [
        { id: '1', content: 'Can you help me with this?', timestamp: '9:00 AM', isOwn: false },
        { id: '2', content: 'Sure! What do you need?', timestamp: '9:01 AM', isOwn: true },
        { id: '3', content: 'Thanks for the help!', timestamp: '9:30 AM', isOwn: false }
      ]
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      lastMessage: 'See you tomorrow!',
      timestamp: '3 hours ago',
      unreadCount: 1,
      isOnline: true,
      isPinned: false,
      phone: '+233667788803',
      lastMessageTime: Date.now() - 10800000,
      messages: [
        { id: '1', content: 'Are we still meeting tomorrow?', timestamp: '8:00 AM', isOwn: false },
        { id: '2', content: 'Yes! 2 PM at the coffee shop', timestamp: '8:01 AM', isOwn: true },
        { id: '3', content: 'See you tomorrow!', timestamp: '8:02 AM', isOwn: false }
      ]
    },
    {
      id: '4',
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      lastMessage: 'Good luck with the presentation!',
      timestamp: '1 day ago',
      unreadCount: 0,
      isOnline: false,
      isPinned: true,
      phone: '+233667788804',
      lastMessageTime: Date.now() - 86400000,
      messages: [
        { id: '1', content: 'How did the presentation go?', timestamp: 'Yesterday', isOwn: false },
        { id: '2', content: 'It went really well, thanks!', timestamp: 'Yesterday', isOwn: true },
        { id: '3', content: 'Good luck with the presentation!', timestamp: 'Yesterday', isOwn: false }
      ]
    }
  ]);

  // Sort chats: pinned first (by last message time), then unpinned by latest activity
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageTime - a.lastMessageTime;
  });

  const filteredChats = sortedChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  // Filter messages based on search query
  const filteredMessages = selectedChatData?.messages.filter(message =>
    message.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
  ) || [];

  const displayMessages = messageSearchQuery ? filteredMessages : selectedChatData?.messages || [];

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    setIsMobileView(true); // Show chat view on mobile
    // Mark chat as read when clicked
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setIsMobileView(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat
          ? {
              ...chat,
              messages: [...chat.messages, newMsg],
              lastMessage: newMessage,
              timestamp: 'Just now',
              lastMessageTime: Date.now()
            }
          : chat
      )
    );

    setNewMessage('');
  };

  const handlePinChat = (chatId: string) => {
    const pinnedCount = chats.filter(chat => chat.isPinned).length;
    const chat = chats.find(c => c.id === chatId);
    
    if (!chat?.isPinned && pinnedCount >= 4) {
      toast({
        title: "Pin limit reached",
        description: "You can only pin up to 4 chats. Unpin a chat first.",
        variant: "destructive"
      });
      return;
    }

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );

    const chatData = chats.find(c => c.id === chatId);
    toast({
      title: chatData?.isPinned ? "Chat unpinned" : "Chat pinned",
      description: chatData?.isPinned 
        ? `${chatData.name} has been unpinned` 
        : `${chatData?.name} has been pinned to the top`
    });
  };

  const handleDeleteMessages = (chatId: string) => {
    if (window.confirm('Are you sure you want to delete all messages in this chat?')) {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId 
            ? { 
                ...chat, 
                messages: [], 
                lastMessage: 'No messages yet',
                timestamp: 'Just now',
                unreadCount: 0 
              } 
            : chat
        )
      );
      
      toast({
        title: "Messages deleted",
        description: "All messages in this chat have been deleted",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat?.phone) {
      const whatsappUrl = `https://wa.me/${chat.phone.replace(/[^0-9]/g, '')}`;
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Opening WhatsApp",
        description: `Starting WhatsApp chat with ${chat.name}`
      });
    }
  };

  const handlePhoneCall = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="h-screen flex border-r">
        {/* Chat List - Full width on mobile when no chat selected, hidden when chat selected */}
        <div className={`${
          selectedChat && isMobileView ? 'hidden lg:flex' : 'flex'
        } lg:min-w-[450px] lg:max-w-md w-full lg:w-auto border-r border-border flex-col bg-background`}>
          {/* Header */}
          <div className="sticky top-0 z-40 bg-background p-4 border-b border-border">
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
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 border rounded-full"
              />
            </div>
          </div>
          
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 ${
                  selectedChat === chat.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                        {chat.isPinned && (
                          <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground flex-shrink-0 ml-2">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate pr-2">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-foreground/80 text-primary-foreground flex-shrink-0">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat Window - Full width on mobile when chat selected */}
        <div className={`${
          selectedChat ? 'flex' : 'hidden lg:flex'
        } flex-1 flex-col bg-background`}>
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={handleBackToList}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedChatData.avatar} alt={selectedChatData.name} />
                      <AvatarFallback>{selectedChatData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedChatData.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedChatData.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatData.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Search Messages Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearching(!isSearching)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  
                  {/* Phone Call Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePhoneCall(selectedChatData.phone)}
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  
                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background">
                      <DropdownMenuItem onClick={() => handlePinChat(selectedChatData.id)}>
                        {selectedChatData.isPinned ? (
                          <>
                            <PinOff className="h-4 w-4 mr-2" />
                            Unpin Chat
                          </>
                        ) : (
                          <>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Chat
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteMessages(selectedChatData.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleWhatsAppChat(selectedChatData.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat on WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Message Search */}
              {isSearching && (
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => {
                        setIsSearching(false);
                        setMessageSearchQuery('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {messageSearchQuery && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found
                    </p>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 rounded-full px-5 py-3 ring-foreground"
                  />
                  <Button onClick={handleSendMessage} className="bg-foreground hover:bg-foreground/80">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
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
