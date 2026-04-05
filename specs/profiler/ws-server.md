**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/ws-server.ts

# WsServer Class [proj.ws.1]

Define `WsServer` class for broadcasting heat profiling data over WebSocket.

## Constructor [proj.ws.1]

- Signature: `constructor(port: number)`
- Store port number
- Create `new ws.Server({port: number})` from `ws` package
- Initialize internal client set

## start Method [proj.ws.1]

- Signature: `start(): Promise<void>`
- Begin listening on configured port
- Register 'connection' event handler: when new client connects, send an initial message with current session info (or empty if no session)
- Return promise that resolves when server is listening

## broadcast Method [proj.ws.1]

- Signature: `broadcast(msg: WsMessage<any>): void`
- Serialize msg to JSON
- Iterate all connected clients
- Send JSON string to each client
- Suppress errors on individual client sends (e.g., if client disconnects during send)

## broadcastSnapshot Method [proj.ws.1]

- Signature: `broadcastSnapshot(snapshot: HeatSnapshot): void`
- Construct WsSnapshotMessage with type='snapshot', sessionId=snapshot.sessionId, payload=snapshot
- Call broadcast(msg)

## broadcastSample Method [proj.ws.1]

- Signature: `broadcastSample(sample: ProfileSample): void`
- Construct WsSampleMessage with type='sample', sessionId=sample.sessionId, payload=sample
- Call broadcast(msg)

## broadcastSessionStart Method [proj.ws.1]

- Signature: `broadcastSessionStart(session: ProfilingSession): void`
- Construct WsSessionStartMessage with type='session_start', sessionId=session.id, payload=session
- Call broadcast(msg)

## broadcastSessionEnd Method [proj.ws.1]

- Signature: `broadcastSessionEnd(summary: SessionSummary): void`
- Construct WsSessionEndMessage with type='session_end', sessionId=summary.id, payload=summary
- Call broadcast(msg)

## getClientCount Method [proj.ws.1]

- Signature: `getClientCount(): number`
- Return count of currently connected clients

## close Method [proj.ws.1]

- Signature: `close(): Promise<void>`
- Close the ws.Server and all active connections
- Return promise that resolves when closed