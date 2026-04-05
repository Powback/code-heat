// [proj.ws.1]
// WebSocket server for broadcasting heat profiling data

import WebSocket, { WebSocketServer } from 'ws';
import type {
  WsMessage,
  HeatSnapshot,
  ProfileSample,
  ProfilingSession,
  SessionSummary,
  WsSnapshotMessage,
  WsSampleMessage,
  WsSessionStartMessage,
  WsSessionEndMessage,
} from './types.js';

// [proj.ws.1]
export class WsServer {
  private port: number;
  private server: WebSocketServer;
  private clients: Set<WebSocket>;

  // [proj.ws.1]
  constructor(port: number) {
    this.port = port;
    this.server = new WebSocketServer({ port });
    this.clients = new Set();
  }

  // [proj.ws.1]
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      // [proj.ws.1]
      this.server.on('listening', () => {
        resolve();
      });

      // [proj.ws.1]
      this.server.on('error', (err) => {
        reject(err);
      });

      // [proj.ws.1]
      this.server.on('connection', (client) => {
        this.clients.add(client);

        // [proj.ws.1]
        const initialMsg: WsMessage<{ connected: boolean }> = {
          type: 'ping',
          sessionId: '',
          payload: { connected: true },
        };
        try {
          client.send(JSON.stringify(initialMsg));
        } catch (err) {
          console.warn('Failed to send initial message:', err);
        }

        client.on('close', () => {
          this.clients.delete(client);
        });

        client.on('error', (err) => {
          console.warn('WebSocket client error:', err);
          this.clients.delete(client);
        });
      });
    });
  }

  // [proj.ws.1]
  broadcast(msg: WsMessage<any>): void {
    const json = JSON.stringify(msg);
    // [proj.ws.1]
    for (const client of this.clients) {
      // [proj.ws.1]
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(json);
        } catch (err) {
          // [proj.ws.1]
          console.warn('Failed to send to client:', err);
        }
      }
    }
  }

  // [proj.ws.1]
  broadcastSnapshot(snapshot: HeatSnapshot): void {
    // [proj.ws.1] Convert Maps to plain objects for JSON serialization
    const filesObj: Record<string, any> = {};
    for (const [url, fileHeat] of snapshot.files.entries()) {
      const linesObj: Record<number, any> = {};
      for (const [lineNum, lineHeat] of fileHeat.lines.entries()) {
        linesObj[lineNum] = lineHeat;
      }
      filesObj[url] = { ...fileHeat, lines: linesObj };
    }
    const serializable = { ...snapshot, files: filesObj };
    const msg: WsSnapshotMessage = {
      type: 'snapshot',
      sessionId: snapshot.sessionId,
      payload: serializable as any,
    };
    // [proj.ws.1]
    this.broadcast(msg);
  }

  // [proj.ws.1]
  broadcastSample(sample: ProfileSample): void {
    // [proj.ws.1]
    const msg: WsSampleMessage = {
      type: 'sample',
      sessionId: sample.sessionId,
      payload: sample,
    };
    // [proj.ws.1]
    this.broadcast(msg);
  }

  // [proj.ws.1]
  broadcastSessionStart(session: ProfilingSession): void {
    // [proj.ws.1]
    const msg: WsSessionStartMessage = {
      type: 'session_start',
      sessionId: session.id,
      payload: session,
    };
    // [proj.ws.1]
    this.broadcast(msg);
  }

  // [proj.ws.1]
  broadcastSessionEnd(summary: SessionSummary): void {
    // [proj.ws.1]
    const msg: WsSessionEndMessage = {
      type: 'session_end',
      sessionId: summary.id,
      payload: summary,
    };
    // [proj.ws.1]
    this.broadcast(msg);
  }

  // [proj.ws.1]
  getClientCount(): number {
    return this.clients.size;
  }

  // [proj.ws.1]
  async close(): Promise<void> {
    return new Promise((resolve) => {
      // [proj.ws.1]
      for (const client of this.clients) {
        try {
          client.close();
        } catch (err) {
          console.warn('Error closing client:', err);
        }
      }
      this.clients.clear();

      // [proj.ws.1]
      this.server.close(() => {
        resolve();
      });
    });
  }
}
