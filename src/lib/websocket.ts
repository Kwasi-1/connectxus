
import { variables } from '@/utils/env';
import { getAccessToken } from './apiClient';
import { toast } from 'sonner';

type MessageHandler = (data: any) => void;
type EventType =
  | 'message.created'
  | 'message.delivered'
  | 'message.read'
  | 'message.deleted'
  | 'message.updated'
  | 'notification.created'
  | 'notification.read'
  | 'notification.deleted'
  | 'post.created'
  | 'post.updated'
  | 'post.deleted'
  | 'post.liked'
  | 'post.unliked'
  | 'comment.created'
  | 'comment.updated'
  | 'comment.deleted'
  | 'typing.started'
  | 'typing.stopped'
  | 'user.online'
  | 'user.offline'
  | 'presence.update';

interface WebSocketMessage {
  type: string;
  channel?: string;
  payload: any;
  timestamp: string;
  id?: string;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private handlers: Map<EventType, Set<MessageHandler>> = new Map();
  private isConnecting = false;
  private isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    const wsUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8000/ws';
    const token = getAccessToken();
    this.url = token ? `${wsUrl}?token=${token}` : wsUrl;
  }

    connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          this.handleReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

    disconnect(): void {
    if (this.ws) {
      this.stopHeartbeat();
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

    private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      toast.error('Connection lost. Please refresh the page.');
    }
  }

    private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);   }

    private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

    private handleMessage(message: WebSocketMessage): void {
        const handlers = this.handlers.get(message.type as EventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.payload);
        } catch (error) {
          console.error(`Error handling ${message.type} message:`, error);
        }
      });
    }
  }

    on(eventType: EventType, handler: MessageHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

    off(eventType: EventType, handler: MessageHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

    send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type,
          payload,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  }

    subscribe(channel: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'subscribe',
          channel: channel,
        })
      );
    } else {
    }
  }

    unsubscribe(channel: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'unsubscribe',
          channel: channel,
        })
      );
    } else {
    }
  }

    isConnectionOpen(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}

let wsClient: WebSocketClient | null = null;

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
};

export const initWebSocket = async (): Promise<WebSocketClient> => {
  const client = getWebSocketClient();
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
    throw error;
  }
};

export default WebSocketClient;
