# code-heat

Real-time performance profiler with visual code heatmaps for Node.js applications. Shows exactly which lines are slow as you use your app by streaming live V8 profiling data to a web dashboard with thermal color overlays on source code.

**Runtime:** Node.js + TypeScript (ESM), monorepo with pnpm workspaces
**Packages:** packages/profiler (Node.js agent), packages/dashboard (Astro SSR), packages/cli (Commander CLI)
**Integration:** PowSync (link:../PowSync) for persistence, Monaco Editor for code display
**Deployment:** Docker Compose with profiler + dashboard + Redis containers

## Architecture

The profiler agent attaches to a running Node.js app via Chrome DevTools Protocol (CDP) on port 9229, samples V8 call stacks, resolves TypeScript source maps, computes line-level heat scores, and streams `HeatSnapshot` events over WebSocket (port 7700) to the Astro dashboard. The dashboard renders Monaco Editor with dynamic line decorations that color code backgrounds from green→yellow→red based on heatScore. PowSync persists sessions and snapshots for historical browsing.

## Files

### packages/profiler/src/types.md
**Output:** packages/profiler/src/types.ts

Core shared type definitions for profiling data [proj.types.1]. `CallFrame` (scriptUrl, lineNumber, columnNumber, functionName, selfTimeMs, totalTimeMs, hitCount), `ProfileSample` (sessionId, timestamp, frames[]), `LineHeat` (scriptUrl, lineNumber, totalHits, avgSelfTimeMs, maxSelfTimeMs, heatScore 0–1), `FileHeat` (scriptUrl, displayPath, lines Map, maxHeat, totalHits, fileScore), `HeatSnapshot` (sessionId, timestamp, files Map, topFunctions[], totalSamples) [proj.types.2]. Session types: `ProfilingSession` (id, target, targetName, startedAt, endedAt?, totalSamples, status, error?), `SessionSummary` (lightweight for listings) [proj.types.3]. WebSocket envelope: `WsMessageType` union, generic `WsMessage<T>`, typed message aliases for sample/snapshot/session_start/session_end/error/subscribe [proj.types.4]. Config: `ProfilerConfig` (targetHost, targetPort, wsPort=7700, sampleIntervalUs=100, snapshotIntervalMs=500, redisUrl?, verbose) [proj.types.5].

### packages/profiler/src/heat-calculator.md
**Output:** packages/profiler/src/heat-calculator.ts

Aggregates raw V8 samples into normalized line heat scores [proj.heat.1]. `HeatAccumulator` class: constructor(windowMs=30000), `addSample(sample)` appends and evicts old samples, `computeSnapshot()` aggregates all samples in window into HeatSnapshot [proj.heat.2]. Algorithm: accumulate hitCount and selfTimeMs per (scriptUrl, lineNumber), normalize heatScore = totalHits/globalMax, build FileHeat objects, extract topFunctions (top 10 by selfTimeMs) [proj.heat.3]. Methods: `clear()`, `getSampleCount()` [proj.heat.4].

### packages/profiler/src/source-mapper.md
**Output:** packages/profiler/src/source-mapper.ts

Resolves compiled JavaScript locations back to original TypeScript source via source maps [proj.srcmap.1]. `SourceMapper` class: `loadSourceMap(scriptUrl, scriptContent)` parses inline `//# sourceMappingURL=` or fetches `.map` file, caches the consumer [proj.srcmap.2]. `resolve(scriptUrl, line, column)` returns `{sourceUrl, line, column}` using source-map library, falls back to original if no map found [proj.srcmap.3]. `resolveFrame(frame: CallFrame)` returns new CallFrame with resolved location [proj.srcmap.4]. `dispose()` destroys all SourceMapConsumers to free memory [proj.srcmap.5].

### packages/profiler/src/cdp-client.md
**Output:** packages/profiler/src/cdp-client.ts

Chrome DevTools Protocol client that attaches to a running Node.js app and drives V8 CPU profiler [proj.cdp.1]. `CdpClient` class: `connect(host, port)` creates CDP connection, enables Runtime, Debugger, and Profiler domains [proj.cdp.2]. `startProfiling(intervalUs)` calls `Profiler.setSamplingInterval` then `Profiler.start` [proj.cdp.3]. `stopProfiling()` calls `Profiler.stop` and returns raw V8 profile [proj.cdp.4]. `getScriptSource(scriptId)` fetches script content for source map extraction [proj.cdp.5]. `onScriptParsed(cb)` registers listener for new scripts loading [proj.cdp.6]. `disconnect()` cleans up [proj.cdp.7]. Uses `chrome-remote-interface` package [proj.cdp.8].

### packages/profiler/src/sampler.md
**Output:** packages/profiler/src/sampler.ts

Continuous sampling loop that converts raw V8 profiles into `ProfileSample` events [proj.sampler.1]. `Sampler` class: constructor takes `CdpClient`, `SourceMapper`, `config: ProfilerConfig` [proj.sampler.2]. `start(sessionId)` begins sampling loop: starts CDP profiler, then on each `snapshotIntervalMs` tick calls `Profiler.takePreciseCoverage`-style sample by stopping/starting profiler and parsing the profile tree [proj.sampler.3]. Converts `ProfileNode` tree from V8 into flat `CallFrame[]` by walking children recursively and computing selfTimeMs from hitCount * intervalUs [proj.sampler.4]. Resolves each frame through `SourceMapper`, emits `ProfileSample` event via EventEmitter [proj.sampler.5]. `stop()` stops the profiler and clears the interval [proj.sampler.6]. Emits: `'sample'` (ProfileSample), `'error'` (Error) [proj.sampler.7].

### packages/profiler/src/ws-server.md
**Output:** packages/profiler/src/ws-server.ts

WebSocket server that broadcasts heat snapshots to connected dashboard clients [proj.ws.1]. `WsServer` class: constructor takes `port: number`, creates `ws.Server` [proj.ws.2]. `start()` begins listening, handles client connections: sends current session info on connect, handles `subscribe` messages [proj.ws.3]. `broadcast(msg: WsMessage<any>)` sends serialized JSON to all connected clients [proj.ws.4]. `broadcastSnapshot(snapshot: HeatSnapshot)` wraps in `WsSnapshotMessage` and broadcasts [proj.ws.5]. `broadcastSample(sample: ProfileSample)` wraps in `WsSampleMessage` and broadcasts [proj.ws.6]. `broadcastSessionStart(session: ProfilingSession)` and `broadcastSessionEnd(summary: SessionSummary)` [proj.ws.7]. `getClientCount()` returns connected client count [proj.ws.8]. `close()` shuts down server [proj.ws.9]. Uses `ws` package [proj.ws.10].

### packages/profiler/src/agent.md
**Output:** packages/profiler/src/agent.ts

Main profiler agent orchestrating CDP connection, sampling, heat calculation, and WebSocket broadcasting [proj.agent.1]. `ProfilerAgent` class: constructor takes `ProfilerConfig` [proj.agent.2]. `attach(target: string)` parses target as `pid` or `host:port`, creates session UUID, initializes CdpClient, SourceMapper, Sampler, HeatAccumulator, WsServer [proj.agent.3]. On each `'sample'` from Sampler: pass to HeatAccumulator, broadcast raw sample via WsServer [proj.agent.4]. On each snapshot interval: call `accumulator.computeSnapshot()`, broadcast snapshot via WsServer, persist to PowSync store if configured [proj.agent.5]. `detach()` stops sampler, closes CDP, clears accumulator, broadcasts session_end [proj.agent.6]. `getSnapshot()` returns current HeatSnapshot [proj.agent.7]. Emits: `'snapshot'` (HeatSnapshot), `'error'` (Error) [proj.agent.8].

### packages/profiler/src/server.md
**Output:** packages/profiler/src/server.ts

Entry point for running the profiler agent as a standalone server process [proj.server.1]. Reads config from environment variables: `TARGET_HOST`, `TARGET_PORT`, `WS_PORT`, `SAMPLE_INTERVAL_US`, `SNAPSHOT_INTERVAL_MS`, `REDIS_URL`, `VERBOSE` [proj.server.2]. Creates `ProfilerAgent` with merged config, calls `attach()`, handles SIGINT/SIGTERM for graceful shutdown [proj.server.3]. Logs startup info: target, WebSocket port, sample interval [proj.server.4].

### packages/profiler/src/store.md
**Output:** packages/profiler/src/store.ts

PowSync integration for persisting profiling sessions and heat snapshots [proj.store.1]. Defines `ProfilingSessionRecord` table with `@table`, `@field`, `@pk` decorators from PowSync: id, target, targetName, startedAt, endedAt, totalSamples, status, topFile, topScore [proj.store.2]. Defines `LineHeatRecord` table: id, sessionId, scriptUrl, lineNumber, heatScore, hitCount, avgSelfTimeMs, snapshotAt [proj.store.3]. `HeatStore` class: `saveSession(session)`, `updateSession(id, updates)`, `saveSnapshot(snapshot)` — extracts top lines per file and upserts LineHeatRecords [proj.store.4]. `getSessions()` returns all SessionSummary records [proj.store.5]. `getSessionHeat(sessionId)` returns LineHeatRecords for a session [proj.store.6]. Uses `serverStore` from `powsync/server` [proj.store.7].

### packages/dashboard/src/types.md
**Output:** packages/dashboard/src/types.ts

Dashboard-side type definitions [proj.dash.types.1]. Re-exports relevant types from profiler: `LineHeat`, `FileHeat`, `HeatSnapshot`, `ProfilingSession`, `SessionSummary`, `WsMessage`, `WsMessageType`, `WsSampleMessage`, `WsSnapshotMessage`, `WsSessionStartMessage`, `WsSessionEndMessage` [proj.dash.types.2]. Dashboard-specific: `HeatmapDecoration` (Monaco line decoration config: lineNumber, colorClass, tooltipText), `FileTreeNode` (displayPath, fileScore, lineCount, isHot boolean), `DashboardState` (currentSession, snapshot, subscribedFile, isConnected, wsUrl) [proj.dash.types.3].

### packages/dashboard/src/lib/ws-client.md
**Output:** packages/dashboard/src/lib/ws-client.ts

Browser WebSocket client that connects to the profiler agent and manages state updates [proj.wsclient.1]. `WsClient` class: constructor takes `url: string` and event callbacks: `onSnapshot`, `onSessionStart`, `onSessionEnd`, `onError` [proj.wsclient.2]. `connect()` creates WebSocket, parses incoming JSON messages by type, dispatches to callbacks [proj.wsclient.3]. `subscribe(sessionId)` sends subscribe message [proj.wsclient.4]. `disconnect()` closes connection [proj.wsclient.5]. `isConnected()` returns readyState === OPEN [proj.wsclient.6]. Auto-reconnect with 3s delay on close [proj.wsclient.7].

### packages/dashboard/src/lib/heat-colors.md
**Output:** packages/dashboard/src/lib/heat-colors.ts

Heatmap color utilities for Monaco Editor line decorations [proj.colors.1]. `heatScoreToRgba(score: number): string` maps 0–1 to RGBA: 0.0–0.2 → green (34,197,94,0.15), 0.2–0.4 → yellow-green (134,197,34,0.20), 0.4–0.6 → orange (249,115,22,0.25), 0.6–0.8 → red-orange (239,68,68,0.30), 0.8–1.0 → critical red (220,38,38,0.45) [proj.colors.2]. `heatScoreToCssClass(score: number): string` returns CSS class name: `heat-cool`, `heat-warm`, `heat-hot`, `heat-very-hot`, `heat-critical` [proj.colors.3]. `formatHeatTooltip(heat: LineHeat): string` returns human-readable tooltip: "Line N: X hits, avg Yms, max Zms" [proj.colors.4]. `getHeatCssVariables(): string` returns a `<style>` block with CSS classes for all heat levels using background-color [proj.colors.5].

### packages/dashboard/src/components/HeatmapEditor.md
**Output:** packages/dashboard/src/components/HeatmapEditor.tsx

React component wrapping Monaco Editor with real-time heatmap line decorations [proj.editor.1]. Props: `fileUrl: string`, `content: string`, `fileHeat: FileHeat | undefined`, `language: string` [proj.editor.2]. Uses `@monaco-editor/react` package. On mount, creates editor with readOnly=true, minimap disabled, theme `vs-dark` [proj.editor.3]. When `fileHeat` changes: clear previous decorations, compute new `IModelDeltaDecoration[]` from lineHeat entries — each decoration has `range` (lineNumber, whole-line) and `options` with `className` from `heatScoreToCssClass` and `hoverMessage` from `formatHeatTooltip` [proj.editor.4]. Applies decorations via `editor.deltaDecorations()` [proj.editor.5]. Renders a `<div>` wrapper with Monaco Editor filling 100% height [proj.editor.6]. Includes injected `<style>` tag from `getHeatCssVariables()` [proj.editor.7].

### packages/dashboard/src/components/FileTree.md
**Output:** packages/dashboard/src/components/FileTree.tsx

React sidebar component showing profiled files sorted by heat score [proj.filetree.1]. Props: `files: FileTreeNode[]`, `selectedUrl: string | undefined`, `onSelect: (url: string) => void` [proj.filetree.2]. Renders sorted list (hottest first) with heat score bar, file name, and total hits [proj.filetree.3]. Each file row shows: colored heat bar (width=fileScore*100%, background from `heatScoreToRgba`), display path, hit count badge [proj.filetree.4]. Selected file highlighted. Clicking calls `onSelect(url)` [proj.filetree.5].

### packages/dashboard/src/components/SessionTimeline.md
**Output:** packages/dashboard/src/components/SessionTimeline.tsx

React component showing a real-time timeline of top function heat over time [proj.timeline.1]. Props: `snapshots: HeatSnapshot[]`, `maxPoints?: number` (default 60) [proj.timeline.2]. Uses a simple SVG line chart: X-axis = time, Y-axis = max heatScore across all files [proj.timeline.3]. Draws polyline connecting snapshot points. Renders top function name from latest snapshot's topFunctions[0] [proj.timeline.4]. Shows current total samples count and session duration [proj.timeline.5].

### packages/dashboard/src/components/HeatLegend.md
**Output:** packages/dashboard/src/components/HeatLegend.tsx

Simple React component rendering the heat color legend [proj.legend.1]. Shows five color swatches (cool/warm/hot/very-hot/critical) with labels and heatScore ranges [proj.legend.2]. Each swatch uses background from `heatScoreToRgba` at center of range [proj.legend.3].

### packages/dashboard/src/components/StatsBar.md
**Output:** packages/dashboard/src/components/StatsBar.tsx

React component showing live profiling stats in a top bar [proj.stats.1]. Props: `session: ProfilingSession | undefined`, `snapshot: HeatSnapshot | undefined`, `isConnected: boolean`, `clientCount?: number` [proj.stats.2]. Shows: connection status dot (green/red), session target name, total samples, top hot function name + score, elapsed time since startedAt [proj.stats.3]. Updates elapsed time with `setInterval` every second [proj.stats.4].

### packages/dashboard/src/pages/index.md
**Output:** packages/dashboard/src/pages/index.astro

Astro page: session list dashboard home [proj.page.index.1]. Fetches session summaries from profiler API endpoint `/api/sessions`. Lists sessions in a table: target, status badge, started, duration, total samples, top file, top score heat bar [proj.page.index.2]. Link to `/session/[id]` for each [proj.page.index.3]. Shows "Connect" button that links to dashboard config [proj.page.index.4]. Uses Astro SSR (output: server) [proj.page.index.5].

### packages/dashboard/src/pages/session.md
**Output:** packages/dashboard/src/pages/session/[id].astro

Astro SSR page for a live profiling session [proj.page.session.1]. Dynamic route `[id]` — gets session ID from params [proj.page.session.2]. Renders full dashboard layout: StatsBar at top, FileTree sidebar (left), HeatmapEditor (center), SessionTimeline (bottom) [proj.page.session.3]. Client-side React island mounts `WsClient`, connects to `PROFILER_WS_URL` env var (default `ws://localhost:7700`), subscribes to session, updates state on snapshot events [proj.page.session.4]. When a file is selected in FileTree, fetches its source content from `/api/file?url=...` and displays in HeatmapEditor with current FileHeat [proj.page.session.5]. `client:only="react"` directive on the main interactive island [proj.page.session.6].

### packages/dashboard/src/pages/api/sessions.md
**Output:** packages/dashboard/src/pages/api/sessions.ts

Astro API endpoint `GET /api/sessions` — returns list of profiling sessions from PowSync store or proxies to profiler agent HTTP endpoint [proj.api.sessions.1]. Returns JSON array of `SessionSummary` [proj.api.sessions.2].

### packages/dashboard/src/pages/api/file.md
**Output:** packages/dashboard/src/pages/api/file.ts

Astro API endpoint `GET /api/file?url=...` — reads source file content for display in Monaco Editor [proj.api.file.1]. Validates URL is a local file path or resolves from project root [proj.api.file.2]. Returns `{ content: string, language: string }` with language detected from extension [proj.api.file.3].

### packages/dashboard/astro.config.md
**Output:** packages/dashboard/astro.config.ts

Astro configuration: SSR mode with Node.js adapter, React integration, environment variables for `PROFILER_WS_URL` and `PROFILER_HTTP_URL` [proj.astro.1]. Port 4321. Vite alias for `@profiler` pointing to `../profiler/src` [proj.astro.2].

### packages/dashboard/package.json.md
**Output:** packages/dashboard/package.json

Dashboard package.json: name `@code-heat/dashboard`, Astro + React + Monaco Editor dependencies, `@astrojs/node` adapter, `@astrojs/react`, `@monaco-editor/react`, `monaco-editor`, link to `@code-heat/profiler` [proj.dash.pkg.1].

### packages/profiler/package.json.md
**Output:** packages/profiler/package.json

Profiler package.json: name `@code-heat/profiler`, dependencies: `chrome-remote-interface`, `source-map`, `ws`, `uuid`, devDeps: tsx, typescript [proj.prof.pkg.1].

### packages/cli/src/index.md
**Output:** packages/cli/src/index.ts

Commander CLI for code-heat [proj.cli.1]. Subcommands: `start <target>` (attach profiler to pid or host:port, starts WsServer, opens dashboard URL), `start --spawn <cmd>` (spawn child process with --inspect then attach), `dashboard` (just open http://localhost:4321 in browser), `record [--duration 30s] <target>` (attach, record for duration, auto-detach), `sessions` (list stored sessions from PowSync), `analyze <file.cpuprofile>` (import existing V8 CPU profile JSON and display heat) [proj.cli.2]. Uses `chalk` and `ora`. Calls `ProfilerAgent` and `WsServer` from profiler package [proj.cli.3].

### packages/cli/package.json.md
**Output:** packages/cli/package.json

CLI package.json: name `@code-heat/cli`, bin `code-heat`, deps: commander, chalk, ora, open, link `@code-heat/profiler` [proj.cli.pkg.1].

### package.json.md
**Output:** package.json

Root monorepo package.json: private, pnpm workspaces `packages/*` and `sample-app`, scripts: dev (parallel), build, start [proj.root.pkg.1].

### pnpm-workspace.yaml.md
**Output:** pnpm-workspace.yaml

PNPM workspace config listing packages/* and sample-app [proj.pnpm.1].

### docker-compose.yml.md
**Output:** docker-compose.yml

Docker Compose for code-heat: `dashboard` service (build packages/dashboard, port 4321, env PROFILER_WS_URL=ws://profiler:7700, PROFILER_HTTP_URL=http://profiler:7701), `profiler` service (build packages/profiler, ports 7700 WebSocket + 7701 HTTP, env TARGET_HOST=host.docker.internal TARGET_PORT=9229 REDIS_URL=redis://redis:6379), `redis` service (redis:7-alpine), Traefik labels for dashboard at `code-heat.pow` [proj.docker.1]. All services on shared `traefik` external network [proj.docker.2].

### packages/profiler/Dockerfile.md
**Output:** packages/profiler/Dockerfile

Multi-stage Dockerfile for profiler: build stage (node:22-alpine, install deps, tsc build), production stage (copy dist + node_modules, CMD node dist/server.js) [proj.docker.prof.1].

### packages/dashboard/Dockerfile.md
**Output:** packages/dashboard/Dockerfile

Multi-stage Dockerfile for dashboard: build stage (node:22-alpine, pnpm install, astro build), production stage (copy dist, CMD node dist/server/entry.mjs) [proj.docker.dash.1].

### sample-app/src/index.md
**Output:** sample-app/src/index.ts

Sample Node.js app for testing code-heat profiling [proj.sample.1]. HTTP server on port 3000 using Node `http` module (no frameworks). Intentionally has hot paths: `/fibonacci?n=<N>` computes fibonacci recursively (slow on large N), `/sort?size=<N>` generates and sorts random array of size N, `/` serves a simple HTML page with links to the test endpoints [proj.sample.2]. Designed so that hitting `/fibonacci?n=40` repeatedly will create obvious heatmap hot spots [proj.sample.3]. Start with `node --inspect src/index.js` so code-heat can attach [proj.sample.4].

### sample-app/package.json.md
**Output:** sample-app/package.json

Sample app package.json: name `code-heat-sample`, scripts: `dev: node --inspect src/index.js`, `build: tsc` [proj.sample.pkg.1].

### README.md.md
**Output:** README.md

Project README covering: what code-heat is, quick start (3 commands: install, start sample app with --inspect, run code-heat start), architecture diagram, CLI reference, Docker usage, PowSync integration notes [proj.readme.1].
