**Type:** React component (TSX)  
**Output:** packages/dashboard/src/components/HeatmapEditor.tsx

## HeatmapEditor Component

### Props Interface [editor.props.1]
- `fileUrl: string` — source file URI/path for display
- `content: string` — full source code
- `fileHeat: FileHeat | undefined` — line-by-line heat data, or undefined if no profile
- `language: string` — Monaco language mode (typescript, javascript, python, etc.)

### Component Render [editor.render.1]
- Render container div with height 100vh, width 100%
- Import and inject CSS from getHeatCssBlock() into <style> tag in document head (once, not per render)
- Mount Monaco Editor via @monaco-editor/react Editor component with:
  - `language={language}`
  - `value={content}`
  - `theme="vs-dark"`
  - `readOnly={true}`
  - `options={{ minimap: { enabled: false }, scrollBeyondLastLine: false }}`

### Decorations Update [editor.decorations.1]
- On fileHeat change: compute IModelDeltaDecoration[] array
- For each LineHeat entry in fileHeat.lines:
  - Create range: startLineNumber = lineNumber, startColumn = 1, endLineNumber = lineNumber, endColumn = 1
  - Derive cssClass from heat score via heatScoreToCssClass()
  - Set hoverMessage to markdown from formatHeatTooltip()
  - Add glyphMarginClassName: "heat-glyph"
  - Push to decorations array
- Apply via editor.deltaDecorations() (clear previous with empty array, add new)

### Error Handling [editor.errors.1]
- Catch missing editor instance gracefully
- Log to console; do not crash component
- Render fallback: <pre>{content}</pre> if Monaco unavailable

### Responsive Layout [editor.layout.1]
- Container fills parent flex layout
- Editor instance calls layout() on window resize via ResizeObserver or ResizeEvent