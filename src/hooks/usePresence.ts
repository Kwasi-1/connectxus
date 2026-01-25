import { useEffect } from 'react';
import { getWebSocketClient } from '@/lib/websocket';

export const useActiveConversation = (
  conversationId: string | null,
  isConnected: boolean = true
) => {
  useEffect(() => {
    if (!conversationId || !isConnected) return;

    const wsClient = getWebSocketClient();

    wsClient.setActiveConversation(conversationId);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wsClient.clearActiveConversation(conversationId);
      } else {
        wsClient.setActiveConversation(conversationId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wsClient.clearActiveConversation(conversationId);
    };
  }, [conversationId, isConnected]);
};

export const useSimpleActiveConversation = (
  conversationId: string | null,
  isConnected: boolean = true
) => {
  useEffect(() => {
    if (!conversationId || !isConnected) return;

    const wsClient = getWebSocketClient();
    wsClient.setActiveConversation(conversationId);

    return () => {
      wsClient.clearActiveConversation(conversationId);
    };
  }, [conversationId, isConnected]);
};
