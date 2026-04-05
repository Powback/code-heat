import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import type { FileHeat } from '../types';
import { heatScoreToCssClass, formatHeatTooltip, getHeatCssBlock } from '../lib/heat-colors';

// [editor.props.1]
interface HeatmapEditorProps {
  fileUrl: string;
  content: string;
  fileHeat: FileHeat | undefined;
  language: string;
}

// [editor.render.1]
export function HeatmapEditor({ fileUrl, content, fileHeat, language }: HeatmapEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [decorations, setDecorations] = useState<string[]>([]);
  const [cssInjected, setCssInjected] = useState(false);

  // Inject CSS once
  useEffect(() => {
    if (!cssInjected) {
      const styleId = 'heat-map-styles';
      if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = getHeatCssBlock();
        document.head.appendChild(styleElement);
      }
      setCssInjected(true);
    }
  }, [cssInjected]);

  // [editor.decorations.1]
  useEffect(() => {
    if (!editorRef.current || !fileHeat) {
      return;
    }

    const editor = editorRef.current;
    const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];

    fileHeat.lines.forEach((lineHeat, lineNumber) => {
      const normalizedScore = lineHeat.totalTime / (fileHeat.maxScore || 1);
      const cssClass = heatScoreToCssClass(normalizedScore);
      const tooltip = formatHeatTooltip(lineHeat);

      newDecorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: cssClass,
          hoverMessage: { value: tooltip },
          glyphMarginClassName: 'heat-glyph',
        },
      });
    });

    // Apply decorations
    const newDecorationIds = editor.deltaDecorations(decorations, newDecorations);
    setDecorations(newDecorationIds);
  }, [fileHeat, fileUrl]);

  // [editor.layout.1]
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    // [editor.layout.1]
    editor.layout();
  };

  // [editor.errors.1]
  if (!content) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: '#1e1e1e',
          color: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <pre style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          {content || 'No content available'}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Editor
        language={language}
        value={content}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          glyphMargin: true,
          lineNumbers: 'on',
          folding: true,
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
