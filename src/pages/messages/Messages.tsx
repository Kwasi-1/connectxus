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
  Archive
} from 'lucide-react';
import { mockChats, mockGroupChats } from '@/data/mockGroupChats';
import { Chat, GroupChat, Message, GroupMessage, MessageTab } from '@/types/messages';
import { User } from '@/types/global';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MessageTab>('all');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState<GroupChat | null>(null);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [groupChats, setGroupChats] = useState<GroupChat[]>(mockGroupChats);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

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
      
      // Clear the navigation state
      navigate('/messages', { replace: true });
    }
  }, [location.state, groupChats, navigate]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroupChats = groupChats.filter(groupChat =>
    groupChat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    groupChat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setSelectedGroupChat(null);
  };

  const handleGroupChatSelect = (groupChat: GroupChat) => {
    setSelectedGroupChat(groupChat);
    setSelectedChat(null);
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
    if (selectedGroupChat) {
      const updatedGroupChat = {
        ...selectedGroupChat,
        isPinned: !selectedGroupChat.isPinned
      };
      setSelectedGroupChat(updatedGroupChat);
      setGroupChats(groupChats.map(gc => gc.id === selectedGroupChat.id ? updatedGroupChat : gc));
    }
  };

  const handleLeaveGroup = () => {
    if (selectedGroupChat) {
      // Remove from group chats list
      setGroupChats(groupChats.filter(gc => gc.id !== selectedGroupChat.id));
      setSelectedGroupChat(null);
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

  const handleViewMembers = () => {
    setShowMembersModal(true);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setSelectedGroupChat(null);
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="flex h-full">
        {/* Chat List Sidebar */}
        <div className={`${selectedChat || selectedGroupChat ? 'hidden lg:flex' : 'flex'} w-full lg:min-w-[450px] lg:max-w-md border-r border-border flex-col`}>
          {/* Header */}
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
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setIsSearchActive(false)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MessageTab)} className="flex-1 flex flex-col">
            <div className='px-4'>
              <TabsList className="grid w-full grid-cols-2 mt-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-2">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat?.id === chat.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
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
                            <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
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
                    <div
                      key={groupChat.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedGroupChat?.id === groupChat.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleGroupChatSelect(groupChat)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={groupChat.avatar} alt={groupChat.name} />
                            <AvatarFallback>{groupChat.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                            <Users className="h-2 w-2 text-primary-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">{groupChat.name}</h3>
                            <div className="flex items-center space-x-2">
                              {groupChat.isPinned && <Pin className="h-3 w-3 text-primary" />}
                              <span className="text-xs text-muted-foreground">{groupChat.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">{groupChat.lastMessage}</p>
                            {groupChat.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2 h-5 min-w-5 flex items-center justify-center text-xs">
                                {groupChat.unreadCount}
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
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedChat.messages.map((message) => (
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
                onToggleSearch={() => setIsSearchActive(!isSearchActive)}
                onPinChat={handlePinChat}
                onLeaveGroup={handleLeaveGroup}
                onManageGroup={handleManageGroup}
                onAddMembers={handleAddMembers}
                onViewMembers={handleViewMembers}
              />

              {/* Group Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedGroupChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                        {!message.isOwn && (
                          <Avatar 
                            className="w-8 h-8 cursor-pointer" 
                            onClick={handleGroupProfileClick}
                          >
                            <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                            <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`px-3 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}>
                          {!message.isOwn && (
                            <p className="text-xs font-medium mb-1 text-primary cursor-pointer" onClick={handleGroupProfileClick}>
                              {message.senderName}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp}
                          </p>
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
