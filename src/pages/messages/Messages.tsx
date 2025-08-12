
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GroupChatHeader } from '@/components/messages/GroupChatHeader';
import { GroupMembersModal } from '@/components/messages/GroupMembersModal';
import { MessageModal } from '@/components/messages/MessageModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GroupChatCard } from '@/components/messages/GroupChatCard';
import { 
  Search, 
  Plus, 
  Send, 
  Smile, 
  Paperclip, 
  MoreHorizontal,
  X,
  Users,
  MessageCircle,
  Pin,
  Archive,
  Phone,
  PinOff,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { mockChats, mockGroupChats } from '@/data/mockGroupChats';
import { Chat, GroupChat, Message, GroupMessage, MessageTab } from '@/types/messages';
import { User } from '@/types/global';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MessageTab>('all');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState<GroupChat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const Pageheader = () => (
    <div className="sticky top-0 z-40 bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button size="icon" variant="ghost" onClick={() => setShowMessageModal(true)}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={activeTab === 'all' ? "Search messages..." : "Search groups..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
            onFocus={() => setIsSearchActive(true)}
            onBlur={() => setIsSearchActive(false)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MessageTab)} className="mb-2 px-4">
        <TabsList className="grid w-full grid-cols-2 mt-2 rounded-full">
          <TabsTrigger className=" rounded-full" value="all">All</TabsTrigger>
          <TabsTrigger className=" rounded-full" value="groups">Groups</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );


  // Mock recipient for message modal
  const mockRecipient: User = {
    id: 'user-1',
    username: 'johndoe',
    displayName: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    verified: false,
    followers: 0,
    following: 0,
    createdAt: new Date(),
    roles: ['student']
  };

  // Handle navigation from group details page
  useEffect(() => {
    if (location.state?.selectedGroupId) {
      const { selectedGroupId, selectedGroupName, selectedGroupAvatar } = location.state;
      
      // Find the group chat or create a mock one if not found
      let groupChat = groupChats.find(gc => gc.id === selectedGroupId);
      
      if (!groupChat) {
        // Create a temporary group chat object for display
        groupChat = {
          id: selectedGroupId,
          name: selectedGroupName,
          avatar: selectedGroupAvatar,
          description: '',
          memberCount: 1,
          lastMessage: 'Start a conversation...',
          timestamp: 'now',
          unreadCount: 0,
          messages: [],
          isPinned: false,
          lastMessageTime: Date.now(),
          isAdmin: false,
          isModerator: false,
          members: []
        };
      }
      
      setSelectedGroupChat(groupChat);
      setActiveTab('groups');
      setSelectedChat(null);
      setIsMobileView(true);
      
      // Clear the navigation state
      navigate('/messages', { replace: true });
    }
  }, [location.state, groupChats, navigate]);

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setChats(mockChats);
        setGroupChats(mockGroupChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Sort chats: pinned first (by last message time), then unpinned by latest activity
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageTime - a.lastMessageTime;
  });

  const filteredChats = sortedChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort and filter group chats
  const sortedGroupChats = [...groupChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageTime - a.lastMessageTime;
  });

  const filteredGroupChats = sortedGroupChats.filter(groupChat =>
    groupChat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    groupChat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setSelectedGroupChat(null);
    setIsMobileView(true);
    // Mark chat as read when clicked
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const handleGroupChatSelect = (groupChat: GroupChat) => {
    setSelectedGroupChat(groupChat);
    setSelectedChat(null);
    setIsMobileView(true);
    // Mark group chat as read
    setGroupChats(prevGroupChats =>
      prevGroupChats.map(gc =>
        gc.id === groupChat.id ? { ...gc, unreadCount: 0 } : gc
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message | GroupMessage = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderId: 'current-user',
      senderName: 'You',
      isOwn: true
    };

    if (selectedChat) {
      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, message as Message],
        lastMessage: newMessage,
        timestamp: 'now',
        lastMessageTime: Date.now()
      };
      setSelectedChat(updatedChat);
      setChats(chats.map(chat => chat.id === selectedChat.id ? updatedChat : chat));
    } else if (selectedGroupChat) {
      const updatedGroupChat = {
        ...selectedGroupChat,
        messages: [...selectedGroupChat.messages, message as GroupMessage],
        lastMessage: newMessage,
        timestamp: 'now',
        lastMessageTime: Date.now()
      };
      setSelectedGroupChat(updatedGroupChat);
      setGroupChats(groupChats.map(gc => gc.id === selectedGroupChat.id ? updatedGroupChat : gc));
    }

    setNewMessage('');
  };

  const handleGroupProfileClick = () => {
    if (selectedGroupChat) {
      navigate(`/groups/${selectedGroupChat.id}`);
    }
  };

  const handlePinChat = () => {
    if (selectedChat) {
      const pinnedCount = chats.filter(chat => chat.isPinned).length;
      
      if (!selectedChat.isPinned && pinnedCount >= 4) {
        toast({
          title: "Pin limit reached",
          description: "You can only pin up to 4 chats. Unpin a chat first.",
          variant: "destructive"
        });
        return;
      }

      const updatedChat = {
        ...selectedChat,
        isPinned: !selectedChat.isPinned
      };
      setSelectedChat(updatedChat);
      setChats(chats.map(chat => chat.id === selectedChat.id ? updatedChat : chat));

      toast({
        title: selectedChat.isPinned ? "Chat unpinned" : "Chat pinned",
        description: selectedChat.isPinned 
          ? `${selectedChat.name} has been unpinned` 
          : `${selectedChat.name} has been pinned to the top`
      });
    } else if (selectedGroupChat) {
      const pinnedCount = groupChats.filter(groupChat => groupChat.isPinned).length;
      
      if (!selectedGroupChat.isPinned && pinnedCount >= 4) {
        toast({
          title: "Pin limit reached",
          description: "You can only pin up to 4 group chats. Unpin a chat first.",
          variant: "destructive"
        });
        return;
      }

      const updatedGroupChat = {
        ...selectedGroupChat,
        isPinned: !selectedGroupChat.isPinned
      };
      setSelectedGroupChat(updatedGroupChat);
      setGroupChats(groupChats.map(gc => gc.id === selectedGroupChat.id ? updatedGroupChat : gc));

      toast({
        title: selectedGroupChat.isPinned ? "Group unpinned" : "Group pinned",
        description: selectedGroupChat.isPinned 
          ? `${selectedGroupChat.name} has been unpinned` 
          : `${selectedGroupChat.name} has been pinned to the top`
      });
    }
  };

  const handleLeaveGroup = () => {
    if (selectedGroupChat) {
      if (window.confirm('Are you sure you want to leave this group?')) {
        // Remove from group chats list
        setGroupChats(groupChats.filter(gc => gc.id !== selectedGroupChat.id));
        setSelectedGroupChat(null);
        setIsMobileView(false);
        
        toast({
          title: "Left group",
          description: "You have left the group chat",
          variant: "destructive"
        });
      }
    }
  };

  const handleManageGroup = () => {
    if (selectedGroupChat) {
      navigate(`/groups/${selectedGroupChat.id}`, { state: { tab: 'settings' } });
    }
  };

  const handleAddMembers = () => {
    // This would typically open a modal to add members
    console.log('Add members functionality');
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

  const handleViewMembers = () => {
    setShowMembersModal(true);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setSelectedGroupChat(null);
    setIsMobileView(false);
  };

  // Determine which messages to display based on active chat
  const displayMessages = selectedChat?.messages || selectedGroupChat?.messages || [];
  const filteredMessages = displayMessages.filter((message: any) =>
    message.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );
  const messagesToShow = messageSearchQuery ? filteredMessages : displayMessages;

  const SearchBar = () => {
    return (
      <div>
        <div className="pt-2 pr-2 w-full max-w-xs ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-full bg-gray-50"
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
      </div>
    );
  };

  if (isLoading) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="h-screen flex">
          <div className="flex lg:min-w-[450px] lg:max-w-md w-full lg:w-auto border-x border-border flex-col bg-background">
            <Pageheader />
            <LoadingSpinner />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="flex max-h-full h-[calc(100vh-128px)] lg:h-screen">
        {/* Chat List Sidebar */}
        <div className={`${(selectedChat || selectedGroupChat) && isMobileView ? 'hidden lg:flex' : 'flex'} w-full lg:min-w-[450px] lg:max-w-md lg:border-r border-border flex-col`}>
          {/* Header */}
          <Pageheader />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MessageTab)} className="flex-1 flex flex-col -mt-2">      
            <TabsContent value="all" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-2">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-4 rounded-md cursor-pointer transition-colors mb-[2px] ${
                        selectedChat?.id === chat.id
                          ? 'bg-muted/50 border border-muted/60'
                          : 'hover:bg-muted/40'
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                            <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {chat.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                            <div className="flex items-center space-x-2">
                              {chat.isPinned && <Pin className="h-3 w-3 text-primary" />}
                              <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                            {chat.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2 h-5 min-w-5 flex items-center justify-center text-xs">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="groups" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-2">
                  {filteredGroupChats.map((groupChat) => (
                    <GroupChatCard
                      key={groupChat.id}
                      groupChat={groupChat}
                      isSelected={selectedGroupChat?.id === groupChat.id}
                      onClick={() => handleGroupChatSelect(groupChat)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Window */}
        <div className={`${selectedChat || selectedGroupChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
          {selectedChat ? (
            <>
              {/* Individual Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={handleBackToChats}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                      <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedChat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedChat.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearching(!isSearching)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePhoneCall(selectedChat.phone)}
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background">
                      <DropdownMenuItem onClick={handlePinChat}>
                        {selectedChat.isPinned ? (
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
                      <DropdownMenuItem onClick={() => handleDeleteMessages(selectedChat.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleWhatsAppChat(selectedChat.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat on WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Message Search */}
              {isSearching && (
                <div className="pt-2 pr-2 w-full max-w-xs ml-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="pl-10 pr-10 rounded-full bg-gray-50"
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
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messagesToShow.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : selectedGroupChat ? (
            <>
              {/* Group Chat Header */}
              <GroupChatHeader
                groupChat={selectedGroupChat}
                onBack={handleBackToChats}
                onToggleSearch={() => setIsSearching(!isSearching)}
                onPinChat={handlePinChat}
                onLeaveGroup={handleLeaveGroup}
                onManageGroup={handleManageGroup}
                onAddMembers={handleAddMembers}
                onViewMembers={handleViewMembers}
              />

              {/* Message Search */}
              {isSearching && (
                <div className="pt-16 pr-2 w-full max-w-xs ml-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="pl-10 pr-10 rounded-full bg-gray-50"
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

              {/* Group Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messagesToShow.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                        {!message.isOwn && (
                          <Avatar 
                            className="w-8 h-8 cursor-pointer mt-1" 
                            onClick={handleGroupProfileClick}
                          >
                            <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                            <AvatarFallback>{message.senderName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                        {!message.isOwn && (
                            <p className="text-xs mb-1 px-1 text-muted-foreground cursor-pointer" onClick={handleGroupProfileClick}>
                              {message.senderName}
                            </p>
                          )}
                        <div className={`px-3 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}>
                          
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp}
                          </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No chat selected</h3>
                <p className="text-muted-foreground">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}

          {/* Message Input */}
          {(selectedChat || selectedGroupChat) && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-10"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {selectedGroupChat && (
          <GroupMembersModal
            isOpen={showMembersModal}
            onClose={() => setShowMembersModal(false)}
            members={selectedGroupChat.members}
            isAdmin={selectedGroupChat.isAdmin}
            isModerator={selectedGroupChat.isModerator}
          />
        )}

        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipient={mockRecipient}
        />
      </div>
    </AppLayout>
  );
};

export default Messages;
