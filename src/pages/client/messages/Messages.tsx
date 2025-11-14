import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

        wsClient.current.on("message.new", (message: any) => {
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
        });

        wsClient.current.on("typing.start", (data: any) => {
          console.log("User typing:", data);
        });
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setWsConnected(false);
      }
    };

    initializeWebSocket();

    return () => {};
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
        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b ${
          isSelected ? "bg-muted" : ""
        }`}
        onClick={() => handleConversationSelect(conversation.id)}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={displayAvatar} />
            <AvatarFallback>
              {displayName[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold truncate">{displayName}</span>
              {lastMessageTime && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(lastMessageTime), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {lastMessageContent}
            </p>
            {conversation.unread_count > 0 && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="flex h-[calc(100vh-4rem)] md:h-screen overflow-hidden">
        <div
          className={`w-full md:w-96 border-r border-border flex flex-col ${
            selectedConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b flex-shrink-0">
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

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as MessageTab)}
            className="px-4 pt-2 flex-shrink-0"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger className="rounded-full" value="all">
                All
              </TabsTrigger>
              <TabsTrigger className="rounded-full" value="groups">
                Groups
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="flex-1 overflow-y-auto">
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
                            <div
                              className={`flex items-center gap-2 ${
                                isOwnMessage ? "flex-row-reverse" : ""
                              }`}
                            >
                              {!isOwnMessage && (
                                <span className="font-semibold text-sm">
                                  {senderName}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(message.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                            <div
                              className={`text-sm mt-1 px-4 py-2 rounded-2xl ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {message.content}
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

              <div className="p-4 border-t flex-shrink-0">
                <div className="flex items-center gap-2">
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
                    className="flex-1"
                  />
                  <Button
                    size="icon"
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
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  Select a conversation to start messaging
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
