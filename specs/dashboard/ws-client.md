**Type:** TypeScript module (class-based)  
**Output:** packages/dashboard/src/lib/ws-client.ts

## WebSocket Client

### WsClient Class [ws.class.1]
Browser-side WebSocket handler for profiler events.

### Constructor [ws.constructor.1]
`constructor(url: string, callbacks: {onSnapshot, onSessionStart, onSessionEnd, onError})`
- `url` — target WebSocket endpoint (e.g., ws://localhost:7700)
- `callbacks.onSnapshot(snapshot: HeatSnapshot): void` — fired on SNAPSHOT_UPDATE
- `callbacks.onSessionStart(session: ProfilingSession): void` — fired on SESSION_START
- `callbacks.onSessionEnd(summary: SessionSummary): void` — fired on SESSION_END
- `callbacks.onError(error: Error): void` — error handler
- Store reference to WebSocket instance and URL internally

### connect() Method [ws.connect.1]
- Create native WebSocket(url)
- Set onopen to mark connected state
- Set onmessage: parse JSON, check `type` field against WsMessageType enum, dispatch payload to appropriate callback
- Set onerror: fire onError(error)
- Set onclose: if not intentional disconnect, schedule reconnect() after 3000ms with exponential backoff (cap at 30s)
- Return Promise<void> resolving when connection opens

### subscribe() Method [ws.subscribe.1]
`subscribe(sessionId: string): void`
- Send JSON message: `{type: "SUBSCRIBE", payload: {sessionId}}`
- Requires connected WebSocket; throw if not connected

### unsubscribe() Method [ws.unsubscribe.1]
`unsubscribe(sessionId: string): void`
- Send JSON message: `{type: "UNSUBSCRIBE", payload: {sessionId}}`

### disconnect() Method [ws.disconnect.1]
- Set internal flag to prevent reconnect
- Call WebSocket.close()

### isConnected() Method [ws.isconnected.1]
- Return boolean: WebSocket.readyState === WebSocket.OPEN

### Error Recovery [ws.recovery.1]
- Track consecutive failed connections
- Reset counter on successful connection
- Log reconnect attempts to console in dev mode