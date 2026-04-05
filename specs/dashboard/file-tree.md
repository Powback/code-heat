**Type:** React component (TSX)  
**Output:** packages/dashboard/src/components/FileTree.tsx

## FileTree Component

### Props Interface [filetree.props.1]
- `files: FileTreeNode[]` — list of profiled files
- `selectedUrl: string | undefined` — currently selected file path
- `onSelect: (url: string) => void` — callback on file click

### Component Render [filetree.render.1]
- Render aside.sidebar with width 250px, background #1e1e1e, border-right 1px solid #404040
- Inside: render header "Files ({files.length})", then list
- Sort files descending by fileScore (hottest first)
- For each FileTreeNode:
  - Render div.file-row with padding 12px, border-bottom 1px solid #2d2d2d
  - Child 1: heat bar (div, width=fileScore*100%, height=4px, background from heatScoreToRgba(fileScore))
  - Child 2: displayPath text (monospace, max-width 200px, white-space nowrap, text-overflow ellipsis)
  - Child 3: badge with hit count and lineCount tooltip
  - Selected row (selectedUrl === node.scriptUrl): background #252526, border-left 3px solid #007acc

### Selection Handling [filetree.select.1]
- On click: call onSelect(node.scriptUrl)
- Update UI immediately (controlled component)

### Empty State [filetree.empty.1]
- If files.length === 0: display "No profiled files"

### Styling [filetree.style.1]
- Use CSS-in-JS or inline styles
- Hover effect: background #2d2d2d on non-selected rows
- Badge styling: background #0e639c, color white, padding 2px 6px, border-radius 3px