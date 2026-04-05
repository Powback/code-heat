import type { HeatSnapshot, ProfilingSession, SessionSummary, WsMessage, WsMessageType } from '../types';

// [ws.class.1]
export class WsClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: {
    onSnapshot: (snapshot: HeatSnapshot) => void;
    onSessionStart: (session: ProfilingSession) => void;
    onSessionEnd: (summary: SessionSummary) => void;
    onError: (error: Error) => void;
  };
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;
  private shouldReconnect = true;

  // [ws.constructor.1]
  constructor(
    url: string,
    callbacks: {
      onSnapshot: (snapshot: HeatSnapshot) => void;
      onSessionStart: (session: ProfilingSession) => void;
      onSessionEnd: (summary: SessionSummary) => void;
      onError: (error: Error) => void;
    }
  ) {
    this.url = url;
    this.callbacks = callbacks;
  }

  // [ws.connect.1]
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          // [ws.recovery.1]
          this.reconnectAttempts = 0;
          if (import.meta.env.DEV) {
            console.log('[WsClient] Connected to', this.url);
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WsMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            this.callbacks.onError(new Error(`Failed to parse message: ${error}`));
          }
        };

        this.ws.onerror = (event) => {
          const error = new Error('WebSocket error occurred');
          this.callbacks.onError(error);
          reject(error);
        };

        this.ws.onclose = () => {
          if (import.meta.env.DEV) {
            console.log('[WsClient] Connection closed');
          }
          if (this.shouldReconnect) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WsMessage): void {
    switch (message.type) {
      case 'SNAPSHOT_UPDATE':
        this.callbacks.onSnapshot(message.payload as HeatSnapshot);
        break;
      case 'SESSION_START':
        this.callbacks.onSessionStart(message.payload as ProfilingSession);
        break;
      case 'SESSION_END':
        this.callbacks.onSessionEnd(message.payload as SessionSummary);
        break;
      default:
        if (import.meta.env.DEV) {
          console.warn('[WsClient] Unknown message type:', message.type);
        }
    }
  }

  // [ws.recovery.1]
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    if (import.meta.env.DEV) {
      console.log(`[WsClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);
    }

    setTimeout(() => {
      this.connect().catch((error) => {
        if (import.meta.env.DEV) {
          console.error('[WsClient] Reconnect failed:', error);
        }
      });
    }, delay);
  }

  // [ws.subscribe.1]
  subscribe(sessionId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    this.ws.send(JSON.stringify({
      type: 'SUBSCRIBE',
      payload: { sessionId },
    }));
  }

  // [ws.unsubscribe.1]
  unsubscribe(sessionId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify({
      type: 'UNSUBSCRIBE',
      payload: { sessionId },
    }));
  }

  // [ws.disconnect.1]
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // [ws.isconnected.1]
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
