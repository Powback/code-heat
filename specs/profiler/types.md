**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/types.ts

# CallFrame Type [proj.types.1]

Define `CallFrame` interface with the following properties:
- `scriptUrl: string` — URL or path of the script where the frame occurred
- `lineNumber: number` — 1-based line number in the script
- `columnNumber: number` — 0-based column number in the script
- `functionName: string` — name of the function, or empty string for anonymous functions
- `selfTimeMs: number` — milliseconds of CPU time spent directly in this frame (excluding callees)
- `totalTimeMs: number` — cumulative milliseconds including all callees
- `hitCount: number` — number of times this frame appeared in samples

# ProfileSample Type [proj.types.1]

Define `ProfileSample` interface with:
- `sessionId: string` — UUID of the active profiling session
- `timestamp: number` — Unix milliseconds when sample was collected
- `frames: CallFrame[]` — array of call stack frames from root to leaf

# LineHeat Type [proj.types.1]

Define `LineHeat` interface with:
- `scriptUrl: string` — location of the source file
- `lineNumber: number` — 1-based line number
- `totalHits: number` — cumulative count of samples hitting this line
- `avgSelfTimeMs: number` — average self time per hit
- `maxSelfTimeMs: number` — peak self time observed
- `heatScore: number` — normalized heat from 0.0 to 1.0 (relative to global max)

# FileHeat Type [proj.types.1]

Define `FileHeat` interface with:
- `scriptUrl: string` — canonical script URL
- `displayPath: string` — human-readable relative or short path for UI
- `lines: Map<number, LineHeat>` — heat data keyed by line number
- `maxHeat: number` — highest heatScore in any line of this file
- `totalHits: number` — sum of all line hits in the file
- `fileScore: number` — overall file heat normalized to 0.0-1.0

# HeatSnapshot Type [proj.types.1]

Define `HeatSnapshot` interface with:
- `sessionId: string` — UUID of the session
- `timestamp: number` — Unix milliseconds of snapshot time
- `files: Map<string, FileHeat>` — heat data keyed by scriptUrl
- `topFunctions: Array<{name: string; selfTimeMs: number; scriptUrl: string; lineNumber: number}>` — top 10 functions by selfTimeMs
- `totalSamples: number` — count of samples included in this snapshot

# ProfilingSession Type [proj.types.1]

Define `ProfilingSession` interface with:
- `id: string` — UUID of the session
- `target: string` — target specifier (pid or host:port)
- `targetName: string` — human-readable target identifier
- `startedAt: number` — Unix milliseconds when profiling began
- `endedAt?: number` — Unix milliseconds when profiling stopped (undefined if active)
- `totalSamples: number` — cumulative sample count
- `status: 'active' | 'stopped' | 'error'` — current state
- `error?: string` — error message if status is 'error'

# SessionSummary Type [proj.types.1]

Define `SessionSummary` as a lightweight version for listings:
- `id: string`
- `target: string`
- `targetName: string`
- `startedAt: number`
- `endedAt?: number`
- `status: 'active' | 'stopped' | 'error'`

# ProfilerConfig Type [proj.types.1]

Define `ProfilerConfig` interface with:
- `targetHost: string` — hostname of target Node.js process
- `targetPort: number` — CDP port of target
- `wsPort?: number` — WebSocket server port (default: 7700)
- `sampleIntervalUs?: number` — CDP sampling interval in microseconds (default: 100)
- `snapshotIntervalMs?: number` — interval for computing snapshots (default: 500)
- `redisUrl?: string` — optional Redis URL for distributed caching
- `verbose?: boolean` — enable debug logging

# WebSocket Message Types [proj.types.1]

Define `WsMessageType` as a union type: `'sample' | 'snapshot' | 'session_start' | 'session_end' | 'error' | 'subscribe' | 'ping' | 'pong'`

Define generic `WsMessage<T>` interface:
- `type: WsMessageType` — message type discriminator
- `sessionId: string` — associated session UUID
- `payload: T` — typed data specific to message type

Define typed message aliases:
- `WsSampleMessage` = `WsMessage<ProfileSample>`
- `WsSnapshotMessage` = `WsMessage<HeatSnapshot>`
- `WsSessionStartMessage` = `WsMessage<ProfilingSession>`
- `WsSessionEndMessage` = `WsMessage<SessionSummary>`
- `WsErrorMessage` = `WsMessage<{code: string; message: string}>`
- `WsSubscribeMessage` = `WsMessage<{sessionIds: string[]}>`