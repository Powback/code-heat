import React, { useMemo } from 'react';
import type { FileTreeNode } from '../types';
import { heatScoreToRgba } from '../lib/heat-colors';

// [filetree.props.1]
interface FileTreeProps {
  files: FileTreeNode[];
  selectedUrl: string | undefined;
  onSelect: (url: string) => void;
}

// [filetree.render.1]
export function FileTree({ files, selectedUrl, onSelect }: FileTreeProps) {
  // [filetree.render.1]
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => b.fileScore - a.fileScore);
  }, [files]);

  // [filetree.empty.1]
  if (files.length === 0) {
    return (
      <aside
        style={{
          width: '250px',
          background: '#1e1e1e',
          borderRight: '1px solid #404040',
          padding: '16px',
          color: '#999',
          textAlign: 'center',
        }}
      >
        No profiled files
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: '250px',
        background: '#1e1e1e',
        borderRight: '1px solid #404040',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #2d2d2d',
          color: '#e0e0e0',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        Files ({files.length})
      </div>

      {/* File list */}
      <div>
        {sortedFiles.map((node) => {
          const isSelected = selectedUrl === node.scriptUrl;

          return (
            <div
              key={node.scriptUrl}
              // [filetree.select.1]
              onClick={() => onSelect(node.scriptUrl)}
              style={{
                padding: '12px',
                borderBottom: '1px solid #2d2d2d',
                cursor: 'pointer',
                // [filetree.render.1]
                background: isSelected ? '#252526' : 'transparent',
                borderLeft: isSelected ? '3px solid #007acc' : '3px solid transparent',
                // [filetree.style.1]
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = '#2d2d2d';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Heat bar */}
              <div
                style={{
                  width: `${node.fileScore * 100}%`,
                  height: '4px',
                  background: heatScoreToRgba(node.fileScore),
                  marginBottom: '8px',
                  borderRadius: '2px',
                }}
              />

              {/* File path */}
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#e0e0e0',
                  maxWidth: '200px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '4px',
                }}
                title={node.displayPath}
              >
                {node.displayPath}
              </div>

              {/* Badge */}
              <div
                style={{
                  display: 'inline-block',
                  // [filetree.style.1]
                  background: '#0e639c',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                title={`${node.lineCount} lines profiled`}
              >
                {node.lineCount} lines
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
