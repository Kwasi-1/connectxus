import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  getConversations,
  getConversationById,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
} from "@/api/messaging.api";
import { getWebSocketClient } from "@/lib/websocket";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Plus,
  Send,
  MessageCircle,
  Check,
  CheckCheck,
  Smile,
  Paperclip,
  Pin,
} from "lucide-react";
import { NewChatModal } from "@/components/messages/NewChatModal";

type MessageTab = "all" | "groups";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MessageTab>("all");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const wsClient = useRef(getWebSocketClient());
  const markedAsReadRef = useRef<Set<string>>(new Set());
  const [wsConnected, setWsConnected] = useState(false);

  const { data: conversations = [], isLoading: loadingConversations } =
    useQuery({
      queryKey: ["conversations"],
      queryFn: () => getConversations({ page: 1, limit: 100 }),
      staleTime: 30000,
    });

  const {
    data: messages = [],
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["conversation-messages", selectedConversationId],
    queryFn: () =>
      selectedConversationId
        ? getConversationMessages(selectedConversationId, {
            page: 1,
            limit: 100,
          })
        : Promise.resolve([]),
    enabled: !!selectedConversationId,
    staleTime: 5000,
    refetchOnMount: true,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => sendMessage(conversationId, { content, message_type: "text" }),
    onMutate: async ({ conversationId, content }) => {
      await queryClient.cancelQueries({
        queryKey: ["conversation-messages", conversationId],
      });

      const previousMessages = queryClient.getQueryData([
        "conversation-messages",
        conversationId,
      ]);

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user?.id || "",
        sender_full_name: user?.full_name || "",
        sender_username: user?.username || "",
        sender_avatar: user?.avatar || null,
        content: content,
        message_type: "text",
        created_at: new Date().toISOString(),
        is_read: true,
      };

      queryClient.setQueryData(
        ["conversation-messages", conversationId],
        (old: any) => {
          return old ? [...old, optimisticMessage] : [optimisticMessage];
        }
      );

      return { previousMessages, conversationId };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["conversation-messages", variables.conversationId],
        (old: any) => {
          if (!old) return [data];
          return old.map((msg: any) =>
            msg.id.startsWith("temp-") ? data : msg
          );
        }
      );

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setNewMessage("");
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["conversation-messages", context.conversationId],
          context.previousMessages
        );
      }
      toast.error("Failed to send message");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (conversationId: string) =>
      markConversationAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        await wsClient.current.connect();
        setWsConnected(true);

        const messageHandler = (message: any) => {
          if (message.conversation_id) {
            queryClient.setQueryData(
              ["conversation-messages", message.conversation_id],
              (old: any) => {
                if (!old) return [message];
                const exists = old.some((m: any) => m.id === message.id);
                if (exists) return old;
                return [...old, message];
              }
            );

            queryClient.invalidateQueries({ queryKey: ["conversations"] });

            if (
              message.conversation_id !== selectedConversationId &&
              message.sender_id !== user?.id
            ) {
              toast.info("New message received");
            }
          }
        };

        const typingHandler = (data: any) => {
          console.log("User typing:", data);
        };

        wsClient.current.on("message.created", messageHandler);
        wsClient.current.on("typing.started", typingHandler);

        return () => {
          wsClient.current.off("message.created", messageHandler);
          wsClient.current.off("typing.started", typingHandler);
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setWsConnected(false);
      }
    };

    const cleanup = initializeWebSocket();

    return () => {
      cleanup?.then((cleanupFn) => cleanupFn?.());
    };
  }, [queryClient, selectedConversationId, user?.id]);

  useEffect(() => {
    if (!selectedConversationId || !wsConnected) return;

    const conversationChannel = `conv:${selectedConversationId}`;

    wsClient.current.subscribe(conversationChannel);
    console.log(`✅ Subscribed to conversation: ${conversationChannel}`);

    return () => {
      wsClient.current.unsubscribe(conversationChannel);
      console.log(`❌ Unsubscribed from conversation: ${conversationChannel}`);
    };
  }, [selectedConversationId, wsConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId && !loadingMessages && messages.length >= 0) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  }, [selectedConversationId, loadingMessages, messages.length]);

  useEffect(() => {
    if (!conversationId) {
      if (selectedConversationId) {
        setSelectedConversationId(null);
      }
      return;
    }

    if (loadingConversations) {
      return;
    }

    const conversationExists = conversations.some(
      (c) => c.id === conversationId
    );

    if (!conversationExists && conversations.length >= 0) {
      getConversationById(conversationId)
        .then((conversation) => {
          queryClient.setQueryData(["conversations"], (oldData: any) => {
            if (!oldData) return [conversation];
            if (oldData.some((c: any) => c.id === conversation.id))
              return oldData;
            return [conversation, ...oldData];
          });

          setSelectedConversationId(conversationId);

          if (!markedAsReadRef.current.has(conversationId)) {
            markedAsReadRef.current.add(conversationId);
            markReadMutation.mutate(conversationId);
          }
        })
        .catch((error) => {
          console.error("Failed to load conversation:", error);
          toast.error("Conversation not found or you don't have access to it");
          navigate("/messages", { replace: true });
        });
      return;
    }

    if (conversationId !== selectedConversationId) {
      setSelectedConversationId(conversationId);
    }

    if (conversationExists && conversationId === selectedConversationId) {
      if (!markedAsReadRef.current.has(conversationId)) {
        markedAsReadRef.current.add(conversationId);
        markReadMutation.mutate(conversationId);
      }
    }
  }, [
    conversationId,
    conversations,
    loadingConversations,
    selectedConversationId,
    navigate,
    queryClient,
  ]);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    markReadMutation.mutate(conversationId);

    navigate(`/messages/${conversationId}`, { replace: true });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: newMessage.trim(),
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (
      activeTab === "groups" &&
      conv.conversation_type !== "group" &&
      conv.conversation_type !== "channel"
    ) {
      return false;
    }
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      conv.name?.toLowerCase().includes(searchLower) ||
      conv.last_message?.content?.toLowerCase().includes(searchLower)
    );
  });

  if (loadingConversations) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const getConversationDisplay = (conversation: any) => {
    if (
      conversation.conversation_type === "group" ||
      conversation.conversation_type === "channel"
    ) {
      return {
        name: conversation.name || "Group Chat",
        avatar: conversation.avatar,
      };
    }

    if (conversation.conversation_type === "direct") {
      if (conversation.participants && conversation.participants.length > 0) {
        const otherParticipant = conversation.participants.find(
          (p: any) => p.id !== user?.id
        );
        if (otherParticipant) {
          return {
            name:
              otherParticipant.full_name || otherParticipant.username || "User",
            avatar: otherParticipant.avatar,
          };
        }
      }

      if (
        conversation.last_sender_full_name ||
        conversation.last_sender_username
      ) {
        return {
          name:
            conversation.last_sender_full_name ||
            conversation.last_sender_username,
          avatar: null,
        };
      }

      return {
        name: conversation.name || "Direct Message",
        avatar: conversation.avatar,
      };
    }

    return {
      name: conversation.name || "Conversation",
      avatar: conversation.avatar,
    };
  };

  const ConversationItem = ({ conversation }: { conversation: any }) => {
    const isSelected = conversation.id === selectedConversationId;
    const { name: displayName, avatar: displayAvatar } =
      getConversationDisplay(conversation);
    const lastMessageContent =
      conversation.last_message_content ||
      conversation.last_message?.content ||
      "No messages yet";
    const lastMessageTime =
      conversation.last_message_time || conversation.last_message?.created_at;

    return (
      <div
        className={`p-4 rounded-md cursor-pointer transition-colors mb-[2px] ${
          isSelected
            ? "bg-muted/50 border border-muted/60"
            : "hover:bg-muted/40"
        }`}
        onClick={() => handleConversationSelect(conversation.id)}
      >
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback>
              {displayName[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground truncate">
                {displayName}
              </h3>
              <div className="flex items-center space-x-2">
                {conversation.is_pinned && (
                  <Pin className="h-3 w-3 text-primary" />
                )}
                {lastMessageTime && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lastMessageTime), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate">
                {lastMessageContent}
              </p>
              {conversation.unread_count > 0 && (
                <Badge
                  variant="default"
                  className="ml-2 h-5 min-w-5 flex items-center justify-center text-xs"
                >
                  {conversation.unread_count}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="flex h-[calc(100vh-4rem)] md:h-screen overflow-hidden">
        <div
          className={`w-full lg:min-w-[450px] lg:max-w-md lg:border-r border-border flex flex-col ${
            selectedConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="sticky top-0 z-40 bg-background">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Messages</h1>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsNewChatModalOpen(true)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as MessageTab)}
            className="mb-2 px-4"
          >
            <TabsList className="grid w-full grid-cols-2 mt-2 rounded-full">
              <TabsTrigger className="rounded-full" value="all">
                All
              </TabsTrigger>
              <TabsTrigger className="rounded-full" value="groups">
                Groups
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div
          className={`flex-1 flex flex-col ${
            selectedConversationId ? "flex" : "hidden md:flex"
          } overflow-hidden`}
        >
          {loadingConversations && selectedConversationId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-4">
                  Loading conversation...
                </p>
              </div>
            </div>
          ) : selectedConversation ? (
            <>
              {(() => {
                const { name: headerName, avatar: headerAvatar } =
                  getConversationDisplay(selectedConversation);
                return (
                  <div className="p-4 border-b flex items-center gap-3 flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={headerAvatar} />
                      <AvatarFallback>
                        {headerName[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="font-semibold">{headerName}</h2>
                      {selectedConversation.conversation_type && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {selectedConversation.conversation_type}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              <ScrollArea className="flex-1 p-4 overflow-y-auto">
                {loadingMessages ? (
                  <LoadingSpinner />
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      const senderName =
                        message.sender_full_name ||
                        message.sender?.full_name ||
                        message.sender_username ||
                        message.sender?.username ||
                        "User";
                      const senderAvatar =
                        message.sender_avatar || message.sender?.avatar;

                      return (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${
                            isOwnMessage ? "flex-row-reverse" : ""
                          }`}
                        >
                          {!isOwnMessage && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={senderAvatar} />
                              <AvatarFallback>
                                {senderName[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`flex-1 max-w-[70%] ${
                              isOwnMessage ? "flex flex-col items-end" : ""
                            }`}
                          >
                            {!isOwnMessage && (
                              <p className="text-xs mb-1 px-1 text-muted-foreground">
                                {senderName}
                              </p>
                            )}
                            <div
                              className={`px-3 py-2 rounded-lg ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwnMessage
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatDistanceToNow(
                                  new Date(message.created_at),
                                  { addSuffix: true }
                                )}
                              </p>
                            </div>

                            {isOwnMessage && (
                              <div className="flex items-center gap-1 mt-1">
                                {message.is_read ? (
                                  <>
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                    {message.read_at && (
                                      <span className="text-xs text-muted-foreground">
                                        Read{" "}
                                        {formatDistanceToNow(
                                          new Date(message.read_at),
                                          { addSuffix: true }
                                        )}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <Check className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      ref={messageInputRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
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
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !newMessage.trim() || sendMessageMutation.isPending
                    }
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No chat selected
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewChatModal
        open={isNewChatModalOpen}
        onOpenChange={setIsNewChatModalOpen}
      />
    </AppLayout>
  );
};

export default Messages;
