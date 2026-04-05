**Type:** TypeScript utility module  
**Output:** packages/dashboard/src/lib/heat-colors.ts

## Heat Color Utilities

### heatScoreToRgba() Function [colors.rgba.1]
`heatScoreToRgba(score: number): string`
- Input: score ∈ [0.0, 1.0]
- Output: RGBA string for background-color
- Ranges:
  - 0.0–0.2 (cool): rgba(34, 197, 94, 0.15) — green
  - 0.2–0.4 (warm): rgba(134, 197, 34, 0.20) — yellow-green
  - 0.4–0.6 (neutral): rgba(249, 115, 22, 0.25) — orange
  - 0.6–0.8 (hot): rgba(239, 68, 68, 0.30) — red
  - 0.8–1.0 (critical): rgba(220, 38, 38, 0.45) — crimson
- Clamp score to [0, 1]

### heatScoreToCssClass() Function [colors.class.1]
`heatScoreToCssClass(score: number): string`
- Output CSS class name:
  - score < 0.2: "heat-cool"
  - score < 0.4: "heat-warm"
  - score < 0.6: "heat-hot"
  - score < 0.8: "heat-very-hot"
  - score ≥ 0.8: "heat-critical"

### formatHeatTooltip() Function [colors.tooltip.1]
`formatHeatTooltip(heat: LineHeat): string`
- Markdown format: `Line {lineNumber}: {hits} hits, avg {averageTime.toFixed(2)}ms, max {maxTime.toFixed(2)}ms`
- Example: "Line 42: 150 hits, avg 1.23ms, max 5.67ms"

### getHeatCssBlock() Function [colors.cssblock.1]
`getHeatCssBlock(): string`
- Returns inline style string with all heat CSS classes
- Each class targets .heat-{level} selector with corresponding rgba + transition
- Include base rule for smooth transitions: `transition: background-color 0.3s ease`

### Color Palette Export [colors.palette.1]
Export object HEAT_PALETTE:
- cool: { hex: '#22c55e', label: '0–20%' }
- warm: { hex: '#86c522', label: '20–40%' }
- hot: { hex: '#f97316', label: '40–60%' }
- veryHot: { hex: '#ef4444', label: '60–80%' }
- critical: { hex: '#dc2626', label: '80–100%' }