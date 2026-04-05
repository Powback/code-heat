**Type:** React component (TSX)  
**Output:** packages/dashboard/src/components/StatsBar.tsx

## StatsBar Component

### Props Interface [stats.props.1]
- `session: ProfilingSession | undefined` — active session metadata
- `snapshot: HeatSnapshot | undefined` — current heat snapshot
- `isConnected: boolean` — WebSocket connection status

### Component Render [stats.render.1]
- Render header bar: height 60px, background #252526, border-bottom 1px solid #404040, flexbox row, align-items center, padding 0 16px
- Sections (left to right):
  1. Connection status: circle 8px (green if isConnected, red if not), text "Connected" / "Disconnected"
  2. Session target: text "Target: {session?.target || '—'}"
  3. Total samples: text "Samples: {snapshot?.totalSamples || 0}"
  4. Top hot function: text "Top: {snapshot?.topFunctions[0]?.name || '(none)'} — {snapshot?.topFunctions[0]?.heat || 0}%"
  5. Elapsed time: text "Elapsed: {elapsed}s" (updated every 1000ms)

### Timer [stats.timer.1]
- useEffect hook: setInterval callback updates elapsed time every 1000ms
- Cleanup on unmount
- Calculate elapsed from session.startTime or snapshot.timestamp

### Styling [stats.style.1]
- Text color: #e0e0e0
- Monospace font for numbers
- Status dot animation: pulse effect on disconnected state

### Error States [stats.errors.1]
- Render gracefully if session or snapshot undefined
- Display "—" for missing data