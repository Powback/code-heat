# code-heat Profiler

Real-time V8 profiler agent for Node.js. Attaches via Chrome DevTools Protocol, samples call stacks, resolves TypeScript source maps, computes line-level heat scores, and streams HeatSnapshot events over WebSocket.

**Runtime:** Node.js + TypeScript (ESM)
**Package:** @code-heat/profiler
**Output dir:** packages/profiler/src/

## Files

### types.md
**Output:** packages/profiler/src/types.ts
Core shared type definitions: `CallFrame` (scriptUrl, lineNumber, columnNumber, functionName, selfTimeMs, totalTimeMs, hitCount), `ProfileSample` (sessionId, timestamp, frames[]), `LineHeat` (scriptUrl, lineNumber, totalHits, avgSelfTimeMs, maxSelfTimeMs, heatScore 0.0-1.0), `FileHeat` (scriptUrl, displayPath, lines Map<number,LineHeat>, maxHeat, totalHits, fileScore), `HeatSnapshot` (sessionId, timestamp, files Map<string,FileHeat>, topFunctions[], totalSamples), `ProfilingSession` (id, target, targetName, startedAt, endedAt?, totalSamples, status:'active'|'stopped'|'error', error?), `SessionSummary` (lightweight listing type), `ProfilerConfig` (targetHost, targetPort, wsPort=7700, sampleIntervalUs=100, snapshotIntervalMs=500, redisUrl?, verbose). WebSocket message types: `WsMessageType` union of 'sample'|'snapshot'|'session_start'|'session_end'|'error'|'subscribe'|'ping'|'pong', generic `WsMessage<T>` envelope with type+sessionId+payload, typed aliases WsSampleMessage/WsSnapshotMessage/WsSessionStartMessage/WsSessionEndMessage/WsErrorMessage/WsSubscribeMessage [proj.types.1].

### heat-calculator.md
**Output:** packages/profiler/src/heat-calculator.ts
Aggregates raw V8 ProfileSamples into normalized line heat scores. `HeatAccumulator` class: constructor(windowMs=30000), `addSample(sample:ProfileSample)` appends and evicts samples older than windowMs, `computeSnapshot():HeatSnapshot` iterates all samples accumulating hitCount and selfTimeMs per (scriptUrl,lineNumber) pair, normalizes heatScore = totalHits/globalMax, builds FileHeat objects, extracts topFunctions top 10 by selfTimeMs. `clear()` and `getSampleCount()` utility methods [proj.heat.1].

### source-mapper.md
**Output:** packages/profiler/src/source-mapper.ts
Resolves compiled JavaScript locations to original TypeScript via source maps. `SourceMapper` class: `loadSourceMap(scriptUrl, scriptContent)` parses inline `//# sourceMappingURL=` or fetches .map file, caches SourceMapConsumer. `resolve(scriptUrl, line, column)` returns {sourceUrl, line, column} using source-map library, falls back to original if no map. `resolveFrame(frame:CallFrame):CallFrame` returns new frame with resolved location. `dispose()` destroys all consumers. Uses `source-map` npm package [proj.srcmap.1].

### cdp-client.md
**Output:** packages/profiler/src/cdp-client.ts
Chrome DevTools Protocol client. `CdpClient` class using `chrome-remote-interface`: `connect(host,port)` enables Runtime+Debugger+Profiler domains, `startProfiling(intervalUs)` calls Profiler.setSamplingInterval+Profiler.start, `stopProfiling()` calls Profiler.stop returns raw profile, `getScriptSource(scriptId)` fetches source, `onScriptParsed(cb)` listener, `disconnect()`. EventEmitter base [proj.cdp.1].

### sampler.md
**Output:** packages/profiler/src/sampler.ts
Continuous sampling loop. `Sampler` class (EventEmitter): constructor(cdpClient, sourceMapper, config). `start(sessionId)` starts CDP profiler then on each snapshotIntervalMs tick: stop+start profiler, parse V8 ProfileNode tree recursively computing selfTimeMs from hitCount*intervalUs, resolve each frame through SourceMapper, emit 'sample' event with ProfileSample. `stop()` clears interval and stops profiler. Emits: 'sample'(ProfileSample), 'error'(Error) [proj.sampler.1].

### ws-server.md
**Output:** packages/profiler/src/ws-server.ts
WebSocket server broadcasting heat data. `WsServer` class: constructor(port:number) creates ws.Server. `start()` begins listening, sends session info on new connections. `broadcast(msg)` sends JSON to all clients. `broadcastSnapshot(snapshot)`, `broadcastSample(sample)`, `broadcastSessionStart(session)`, `broadcastSessionEnd(summary)` typed broadcast methods. `getClientCount()`. `close()`. Uses `ws` package [proj.ws.1].

### agent.md
**Output:** packages/profiler/src/agent.ts
Main orchestrator. `ProfilerAgent` class (EventEmitter): constructor(config:ProfilerConfig). `attach(target:string)` parses pid or host:port, creates session UUID, wires up CdpClient+SourceMapper+Sampler+HeatAccumulator+WsServer. On 'sample' from Sampler: feeds HeatAccumulator, broadcasts via WsServer. On snapshot interval: computeSnapshot(), broadcast, persist to HeatStore. `detach()` stops all components, broadcasts session_end. `getSnapshot():HeatSnapshot`. Emits 'snapshot','error' [proj.agent.1].

### store.md
**Output:** packages/profiler/src/store.ts
PowSync persistence. Imports `table, field, pk, serverStore` from `powsync/server` (path: `../../PowSync/src/server-entry.ts`). Defines `ProfilingSessionRecord` @table('profiling_sessions'): @pk id, @field target/targetName/startedAt/endedAt/totalSamples/status/topFile/topScore. Defines `LineHeatRecord` @table('line_heat_snapshots'): @pk id, @field sessionId/scriptUrl/lineNumber/heatScore/hitCount/avgSelfTimeMs/snapshotAt. `HeatStore` class: saveSession, updateSession, saveSnapshot (extracts top lines per file, upserts records), getSessions, getSessionHeat [proj.store.1].

### server.md
**Output:** packages/profiler/src/server.ts
Standalone server entry point. Reads env: TARGET_HOST, TARGET_PORT, WS_PORT, SAMPLE_INTERVAL_US, SNAPSHOT_INTERVAL_MS, REDIS_URL, VERBOSE. Creates ProfilerAgent, calls attach(), handles SIGINT/SIGTERM for graceful shutdown, logs startup info [proj.server.1].
