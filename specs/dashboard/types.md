**Type:** TypeScript type definitions  
**Output:** packages/dashboard/src/types.ts

## Type Definitions

### Imports [types.imports.1]
Re-export from @code-heat/profiler: LineHeat, FileHeat, HeatSnapshot, ProfilingSession, SessionSummary, WsMessage, WsMessageType.

### LineHeat Type [types.lineheat.1]
Represents profiling data for a single source line:
- `lineNumber: number` — 1-indexed line number
- `hits: number` — execution count
- `totalTime: number` — cumulative milliseconds on this line
- `averageTime: number` — totalTime / hits
- `maxTime: number` — single-execution maximum milliseconds

### FileHeat Type [types.fileheat.1]
Aggregated heatmap for a complete file:
- `filePath: string` — absolute or workspace-relative path
- `lines: Map<number, LineHeat>` — lineNumber → LineHeat
- `totalHits: number` — sum of all line hits
- `maxScore: number` — 0-1 normalized intensity

### HeatmapDecoration Type [types.decoration.1]
Monaco Editor decoration object:
- `lineNumber: number` — 1-indexed target line
- `colorClass: string` — CSS class name from heatScoreToCssClass (heat-cool, heat-warm, heat-hot, heat-very-hot, heat-critical)
- `tooltipText: string` — markdown-formatted hover text from formatHeatTooltip

### FileTreeNode Type [types.filetreenode.1]
Sortable representation of a profiled file in tree view:
- `displayPath: string` — relative path for UI display
- `fileScore: number` — 0-1 normalized max heat across all lines
- `lineCount: number` — total lines in file
- `isHot: boolean` — true if fileScore > 0.6
- `scriptUrl: string` — URI/import path for Monaco language detection

### DashboardState Type [types.dashstate.1]
Client-side state container:
- `currentSession: ProfilingSession | undefined` — active session or null
- `snapshot: HeatSnapshot | undefined` — latest heat snapshot
- `subscribedFile: string | undefined` — currently displayed file path
- `isConnected: boolean` — WebSocket connection status
- `wsUrl: string` — target WS endpoint

### Constants [types.constants.1]
Export default HEAT_SCORE_THRESHOLDS: { cool: 0.2, warm: 0.4, hot: 0.6, veryHot: 0.8 }