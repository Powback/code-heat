**Type:** Astro page  
**Output:** packages/dashboard/src/pages/index.astro

## Home / Sessions List Page

### Page Structure [page.index.layout.1]
- Render full-width page with centered content area (max-width 1200px)
- Head: <title>code-heat Dashboard</title>

### Data Fetching [page.index.fetch.1]
- Call fetch(`${PROFILER_HTTP_URL}/api/sessions`) at build/render time
- Fallback mock data if fetch fails: empty array or sample SessionSummary objects
- Parse response as SessionSummary[]

### Table Render [page.index.table.1]
- If data.length === 0: render "No sessions running" centered message
- Else: render HTML table with columns:
  - Target: {session.target}
  - Status: badge (green background if active, gray if stopped), text "Active" / "Stopped"
  - Started: {formatDate(session.startTime)}
  - Duration: {Math.floor((Date.now() - session.startTime) / 1000)}s
  - Total Samples: {session.totalSamples}
  - Top File: {session.topFile || '—'}
  - Heat Score: horizontal bar (width = session.maxScore * 100%, background from heatScoreToRgba)

### Row Links [page.index.links.1]
- Each row is clickable <a href="/session/{session.id}">
- Cursor pointer, hover: background #f5f5f5

### Styling [page.index.style.1]
- Table: border-collapse collapse, width 100%
- Cells: padding 12px, text-align left, border-bottom 1px solid #e0e0e0
- Header row: background #f9f9f9, font-weight bold

### Auto-refresh [page.index.refresh.1]
- Optional: add <meta http-equiv="refresh" content="5"> for periodic reload, or fetch client-side