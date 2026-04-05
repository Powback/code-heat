// [proj.srcmap.1]
// Source map resolver for TypeScript/JavaScript mappings

import { SourceMapConsumer } from 'source-map';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { CallFrame } from './types.js';

// [proj.srcmap.1]
export class SourceMapper {
  private cache: Map<string, SourceMapConsumer | null>;

  // [proj.srcmap.1]
  constructor() {
    // [proj.srcmap.1]
    this.cache = new Map();
  }

  // [proj.srcmap.1]
  async loadSourceMap(scriptUrl: string, scriptContent: string): Promise<void> {
    // [proj.srcmap.1]
    if (this.cache.has(scriptUrl)) {
      return;
    }

    try {
      // [proj.srcmap.1]
      const sourceMapMatch = scriptContent.match(/\/\/# sourceMappingURL=(.+?)(?:\s|$)/);
      if (!sourceMapMatch) {
        // [proj.srcmap.1]
        console.warn(`No source map found for ${scriptUrl}`);
        this.cache.set(scriptUrl, null);
        return;
      }

      const sourceMapUrl = sourceMapMatch[1];
      let rawSourceMap: any;

      // [proj.srcmap.1]
      if (sourceMapUrl.startsWith('data:application/json;base64,')) {
        // [proj.srcmap.1]
        const base64Data = sourceMapUrl.substring('data:application/json;base64,'.length);
        const decoded = Buffer.from(base64Data, 'base64').toString('utf-8');
        rawSourceMap = JSON.parse(decoded);
      } else {
        // [proj.srcmap.1]
        const scriptDir = path.dirname(scriptUrl.replace('file://', ''));
        const mapPath = path.join(scriptDir, sourceMapUrl);
        try {
          const mapContent = await fs.readFile(mapPath, 'utf-8');
          rawSourceMap = JSON.parse(mapContent);
        } catch (err) {
          // [proj.srcmap.1]
          console.warn(`Failed to load source map file ${mapPath}:`, err);
          this.cache.set(scriptUrl, null);
          return;
        }
      }

      // [proj.srcmap.1]
      const consumer = await new SourceMapConsumer(rawSourceMap);
      // [proj.srcmap.1]
      this.cache.set(scriptUrl, consumer);
    } catch (err) {
      // [proj.srcmap.1]
      console.warn(`Error processing source map for ${scriptUrl}:`, err);
      // [proj.srcmap.1]
      this.cache.set(scriptUrl, null);
    }
  }

  // [proj.srcmap.1]
  resolve(
    scriptUrl: string,
    line: number,
    column: number
  ): { sourceUrl: string; line: number; column: number } {
    // [proj.srcmap.1]
    const consumer = this.cache.get(scriptUrl);

    // [proj.srcmap.1]
    if (consumer) {
      try {
        // [proj.srcmap.1]
        const original = consumer.originalPositionFor({ line, column });
        // [proj.srcmap.1]
        if (original.source && original.line !== null && original.line > 0) {
          return {
            sourceUrl: original.source,
            line: original.line,
            column: original.column ?? column,
          };
        }
      } catch (err) {
        // [proj.srcmap.1]
        console.warn(`Source map resolution failed for ${scriptUrl}:${line}:${column}`, err);
      }
    }

    // [proj.srcmap.1]
    return { sourceUrl: scriptUrl, line, column };
  }

  // [proj.srcmap.1]
  resolveFrame(frame: CallFrame): CallFrame {
    // [proj.srcmap.1]
    const resolved = this.resolve(frame.scriptUrl, frame.lineNumber, frame.columnNumber);
    // [proj.srcmap.1]
    return {
      scriptUrl: resolved.sourceUrl,
      lineNumber: resolved.line,
      columnNumber: resolved.column,
      functionName: frame.functionName,
      selfTimeMs: frame.selfTimeMs,
      totalTimeMs: frame.totalTimeMs,
      hitCount: frame.hitCount,
    };
  }

  // [proj.srcmap.1]
  dispose(): void {
    // [proj.srcmap.1]
    for (const consumer of this.cache.values()) {
      if (consumer) {
        try {
          consumer.destroy();
        } catch (err) {
          console.warn('Error destroying source map consumer:', err);
        }
      }
    }
    // [proj.srcmap.1]
    this.cache.clear();
  }
}
