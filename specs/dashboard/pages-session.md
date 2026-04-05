**Type:** Astro SSR page with React island  
**Output:** packages/dashboard/src/pages/session/[id].astro

## Live Session Heatmap Page

### Route & Props [page.session.route.1]
- Dynamic route: [id].astro matching /session/{sessionId}
- Extract sessionId from Astro.params.id

### Page Layout [page.session.layout.1]
- Render multi-pane layout:
  - Top: StatsBar component (full width, height 60px)
  - Main grid: 3 columns
    - Left column (250px): FileTree
    - Center column (flex): HeatmapEditor
    - Bottom strip (full width, height 150px): SessionTimeline
- Use CSS grid or flexbox for responsiveness

### Client-side Hydration [page.session.client.1]
- Wrap interactive content in React island with client:only="react"
- Import and mount WsClient to PROFILER_WS_URL environment variable
- Default: ws://localhost:7700
- On component mount: create WsClient, connect(), subscribe(sessionId)

### State Management [page.session.state.1]
- Use React.useState for DashboardState
- On snapshot: setState({currentSnapshot, files: buildFileTreeFromSnapshot()})
- On sessionStart: setState({currentSession})
- On sessionEnd: mark as stopped, optionally redirect to /

### File Selection [page.session.fileselect.1]
- FileTree onSelect callback:
  - Fetch `/api/file?url={encodeURIComponent(selectedUrl)}`
  - Parse response: {content, language}
  - setState({subscribedFile, editorContent, language})
  - HeatmapEditor re-renders with new content + fileHeat from snapshot

### Cleanup [page.session.cleanup.1]
- useEffect return: unsubscribe() and disconnect() on unmount

### Error Handling [page.session.errors.1]
- Catch fetch errors gracefully
- Display "Connection failed" in StatsBar
- Render empty editor if file fetch fails