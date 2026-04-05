**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/store.ts

# PowSync Data Models [proj.store.1]

## Imports [proj.store.1]

- Import `{table, field, pk, serverStore}` from `powsync/server` (resolve path as `../../PowSync/src/server-entry.ts`)

## ProfilingSessionRecord Table [proj.store.1]

Define `ProfilingSessionRecord` as a PowSync table:
- Decorator: `@table('profiling_sessions')`
- Field: `@pk id: string` — primary key (UUID)
- Field: `@field target: string` — target specifier (pid or host:port)
- Field: `@field targetName: string` — human-readable target name
- Field: `@field startedAt: number` — Unix milliseconds of start
- Field: `@field endedAt?: number` — Unix milliseconds of end (nullable)
- Field: `@field totalSamples: number` — cumulative sample count
- Field: `@field status: string` — 'active' | 'stopped' | 'error'
- Field: `@field topFile?: string` — scriptUrl of hottest file (optional)
- Field: `@field topScore?: number` — highest file heat score (optional)

## LineHeatRecord Table [proj.store.1]

Define `LineHeatRecord` as a PowSync table:
- Decorator: `@table('line_heat_snapshots')`
- Field: `@pk id: string` — primary key (UUID)
- Field: `@field sessionId: string` — foreign key to ProfilingSessionRecord.id
- Field: `@field scriptUrl: string` — source file URL
- Field: `@field lineNumber: number` — 1-based line number
- Field: `@field heatScore: number` — normalized heat 0.0-1.0
- Field: `@field hitCount: number` — sample count
- Field: `@field avgSelfTimeMs: number` — average self time
- Field: `@field snapshotAt: number` — Unix milliseconds of snapshot timestamp

## HeatStore Class [proj.store.1]

Define `HeatStore` class for persisting profiling data.

### saveSession Method [proj.store.1]

- Signature: `saveSession(session: ProfilingSession): Promise<void>`
- Convert ProfilingSession to ProfilingSessionRecord
- Upsert record into serverStore using the 'profiling_sessions' table
- Use session.id as the primary key

### updateSession Method [proj.store.1]

- Signature: `updateSession(session: ProfilingSession): Promise<void>`
- Update existing ProfilingSessionRecord with new values (endedAt, status, totalSamples)
- Use session.id as the primary key

### saveSnapshot Method [proj.store.1]

- Signature: `saveSnapshot(snapshot: HeatSnapshot): Promise<void>`
- Extract top lines per file (e.g., top 20 lines per file by heatScore)
- For each extracted line:
  - Generate UUID for id
  - Create LineHeatRecord: id, sessionId=snapshot.sessionId, scriptUrl, lineNumber, heatScore, hitCount, avgSelfTimeMs, snapshotAt=snapshot.timestamp
  - Upsert into serverStore using 'line_heat_snapshots' table
- On success, update session record's topFile and topScore based on snapshot.files

### getSessions Method [proj.store.1]

- Signature: `getSessions(): Promise<SessionSummary[]>`
- Query all ProfilingSessionRecord from serverStore
- Convert each to SessionSummary
- Return array of summaries

### getSessionHeat Method [proj.store.1]

- Signature: `getSessionHeat(sessionId: string): Promise<Map<string, FileHeat>>`
- Query all LineHeatRecord where sessionId matches
- Group by scriptUrl
- Reconstruct FileHeat objects from grouped records
- Return Map<scriptUrl, FileHeat>