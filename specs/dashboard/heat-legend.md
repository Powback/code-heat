**Type:** React component (TSX)  
**Output:** packages/dashboard/src/components/HeatLegend.tsx

## HeatLegend Component

### Props Interface [legend.props.1]
None (stateless presentation).

### Component Render [legend.render.1]
- Render div.legend with flexbox row, gap 16px, padding 12px, background #252526, border-top 1px solid #404040
- For each heat level in HEAT_PALETTE (cool, warm, hot, veryHot, critical):
  - Render div.heat-swatch with:
    - Colored box (width 20px, height 20px, background from heatScoreToRgba at threshold midpoint)
    - Label text: "{label}" (e.g., "Cool 0–20%")
    - Score range in smaller text: "0–0.2"

### Color Mapping [legend.colors.1]
- Use heatScoreToRgba() to generate swatch backgrounds dynamically
- Thresholds: [0.1, 0.3, 0.5, 0.7, 0.9] for midpoint colors

### Accessibility [legend.a11y.1]
- Include aria-label on color swatches
- Ensure sufficient color contrast for text labels