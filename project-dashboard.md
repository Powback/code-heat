# code-heat Dashboard

Astro SSR web dashboard for viewing real-time profiling heatmaps. Connects via WebSocket to the profiler agent, displays Monaco Editor with thermal color overlays on source code lines, and shows performance timelines.

**Runtime:** Node.js + TypeScript (ESM), Astro SSR + React islands
**Package:** @code-heat/dashboard
**Output dir:** packages/dashboard/

## Files

### src/types.md
**Output:** packages/dashboard/src/types.ts
Dashboard type definitions. Re-exports from profiler types: LineHeat, FileHeat, HeatSnapshot, ProfilingSession, SessionSummary, WsMessage, WsMessageType. Dashboard-specific: `HeatmapDecoration` (lineNumber, colorClass, tooltipText), `FileTreeNode` (displayPath:string, fileScore:number, lineCount:number, isHot:boolean, scriptUrl:string), `DashboardState` (currentSession:ProfilingSession|undefined, snapshot:HeatSnapshot|undefined, subscribedFile:string|undefined, isConnected:boolean, wsUrl:string) [proj.dash.types.1].

### src/lib/ws-client.md
**Output:** packages/dashboard/src/lib/ws-client.ts
Browser WebSocket client. `WsClient` class: constructor(url:string, callbacks:{onSnapshot,onSessionStart,onSessionEnd,onError}). `connect()` creates WebSocket, parses incoming JSON by WsMessageType, dispatches to callbacks. `subscribe(sessionId)` sends subscribe message. `disconnect()`. `isConnected():boolean`. Auto-reconnect with 3s delay on unexpected close [proj.wsclient.1].

### src/lib/heat-colors.md
**Output:** packages/dashboard/src/lib/heat-colors.ts
Heatmap color utilities. `heatScoreToRgba(score:number):string` maps 0-1 to RGBA: 0.0-0.2 → rgba(34,197,94,0.15) green, 0.2-0.4 → rgba(134,197,34,0.20) yellow-green, 0.4-0.6 → rgba(249,115,22,0.25) orange, 0.6-0.8 → rgba(239,68,68,0.30) red, 0.8-1.0 → rgba(220,38,38,0.45) critical. `heatScoreToCssClass(score):string` returns heat-cool/warm/hot/very-hot/critical. `formatHeatTooltip(heat:LineHeat):string` "Line N: X hits, avg Yms, max Zms". `getHeatCssBlock():string` returns style element content with all CSS classes [proj.colors.1].

### src/components/HeatmapEditor.md
**Output:** packages/dashboard/src/components/HeatmapEditor.tsx
React Monaco Editor wrapper with heatmap decorations. Props: fileUrl:string, content:string, fileHeat:FileHeat|undefined, language:string. Uses @monaco-editor/react, readOnly=true, theme vs-dark, minimap disabled. On fileHeat change: clear decorations, compute IModelDeltaDecoration[] from lineHeat entries (whole-line range, className from heatScoreToCssClass, hoverMessage from formatHeatTooltip), apply via deltaDecorations. Renders div wrapper + Monaco filling 100% height + injected style from getHeatCssBlock [proj.editor.1].

### src/components/FileTree.md
**Output:** packages/dashboard/src/components/FileTree.tsx
Sidebar showing profiled files by heat. Props: files:FileTreeNode[], selectedUrl:string|undefined, onSelect:(url:string)=>void. Renders list sorted hottest-first. Each row: colored heat bar (width=fileScore*100%, background from heatScoreToRgba), display path, hit count badge. Selected file highlighted. Click calls onSelect [proj.filetree.1].

### src/components/SessionTimeline.md
**Output:** packages/dashboard/src/components/SessionTimeline.tsx
Real-time SVG timeline chart. Props: snapshots:HeatSnapshot[], maxPoints?:number (default 60). SVG line chart: X=time, Y=max heatScore across all files. Draws polyline. Shows top function name from latest snapshot.topFunctions[0], total samples, session duration [proj.timeline.1].

### src/components/HeatLegend.md
**Output:** packages/dashboard/src/components/HeatLegend.tsx
Heat color legend. Shows 5 color swatches (cool/warm/hot/very-hot/critical) with labels and score ranges. Uses heatScoreToRgba for swatch backgrounds [proj.legend.1].

### src/components/StatsBar.md
**Output:** packages/dashboard/src/components/StatsBar.tsx
Top stats bar. Props: session:ProfilingSession|undefined, snapshot:HeatSnapshot|undefined, isConnected:boolean. Shows connection status dot (green/red), session target, total samples, top hot function + score, elapsed time updated every second via setInterval [proj.stats.1].

### src/pages/index.md
**Output:** packages/dashboard/src/pages/index.astro
Home page listing sessions. Fetches SessionSummary[] from /api/sessions. Table with: target, status badge (green=active/gray=stopped), started time, duration, total samples, top file, heat score bar. Each row links to /session/[id]. Shows "No sessions" state. Astro SSR [proj.page.index.1].

### src/pages/session.md
**Output:** packages/dashboard/src/pages/session/[id].astro
Live session heatmap page. Dynamic route [id]. Layout: StatsBar top, FileTree left sidebar, HeatmapEditor center, SessionTimeline bottom strip. Client-side React island (client:only="react") mounts WsClient to PROFILER_WS_URL env (default ws://localhost:7700), subscribes to session, updates state on snapshots. File selection fetches source from /api/file?url=... and updates editor [proj.page.session.1].

### src/pages/api/sessions.md
**Output:** packages/dashboard/src/pages/api/sessions.ts
GET /api/sessions Astro endpoint. Fetches session list from profiler HTTP endpoint (PROFILER_HTTP_URL env) or returns mock data. Returns JSON SessionSummary[] [proj.api.sessions.1].

### src/pages/api/file.md
**Output:** packages/dashboard/src/pages/api/file.ts
GET /api/file?url=... Astro endpoint. Reads local file content for Monaco display. Validates path, detects language from extension (ts→typescript, js→javascript, py→python, etc). Returns {content:string, language:string} [proj.api.file.1].

### astro.config.md
**Output:** packages/dashboard/astro.config.ts
Astro SSR config: @astrojs/node adapter (standalone mode), @astrojs/react integration. Env vars PROFILER_WS_URL, PROFILER_HTTP_URL. Server port 4321. Vite alias @profiler → ../profiler/src [proj.astro.config.1].

### package.json.md
**Output:** packages/dashboard/package.json
Dashboard package.json: name @code-heat/dashboard, private, type module. Scripts: dev (astro dev), build (astro build), start (node dist/server/entry.mjs). Deps: astro, @astrojs/node, @astrojs/react, @monaco-editor/react, monaco-editor, react, react-dom. DevDeps: typescript, @types/react. Workspace dep: @code-heat/profiler [proj.dash.pkg.1].
