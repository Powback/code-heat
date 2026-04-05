**Type:** React component (TSX)  
**Output:** packages/dashboard/src/components/SessionTimeline.tsx

## SessionTimeline Component

### Props Interface [timeline.props.1]
- `snapshots: HeatSnapshot[]` — ordered time-series of heat snapshots
- `maxPoints?: number` — max points to display (default 60); truncate older if exceeds

### SVG Chart Render [timeline.render.1]
- Container div width 100%, height 150px
- Inside: SVG 100% × 150px viewBox="0 0 800 150"
- Draw axes: bottom line (y=140), left line (x=10)
- Draw polyline: X-coordinates evenly spaced across snapshots, Y-coordinate = (1 - maxScore) * 100 (inverted so high heat = high Y)
- Stroke: #f97316, strokeWidth 2, fill: none
- Dot at each point: circle r=3, fill #f97316

### Data Extraction [timeline.data.1]
- If snapshots.length > maxPoints: slice last maxPoints entries
- For each snapshot: extract maxScore (maximum heat across all files in that snapshot)
- Calculate Y as normalized to SVG height: y = 140 - (maxScore * 100)

### Labels [timeline.labels.1]
- Below SVG: flexbox row with:
  - "Top function: {snapshots[-1].topFunctions[0]?.name || '(none)'}"
  - "Total samples: {snapshots[-1].totalSamples || 0}"
  - "Duration: {elapsed_seconds}s" (calculate from first/last snapshot timestamps)

### Responsive Scaling [timeline.responsive.1]
- Container rescales SVG on window resize
- SVG viewBox maintains aspect ratio