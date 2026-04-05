// [proj.heat.1]
// Heat accumulator for aggregating samples into metrics

import type { ProfileSample, HeatSnapshot, FileHeat, LineHeat, CallFrame } from './types.js';

interface LineAccumulator {
  scriptUrl: string;
  lineNumber: number;
  hitCount: number;
  totalSelfTimeMs: number;
  maxSelfTimeMs: number;
}

interface FunctionAccumulator {
  name: string;
  scriptUrl: string;
  lineNumber: number;
  totalSelfTimeMs: number;
}

// [proj.heat.1]
export class HeatAccumulator {
  private windowMs: number;
  private samples: ProfileSample[];

  // [proj.heat.1]
  constructor(windowMs: number = 30000) {
    // [proj.heat.1]
    this.windowMs = windowMs;
    // [proj.heat.1]
    this.samples = [];
  }

  // [proj.heat.1]
  addSample(sample: ProfileSample): void {
    // [proj.heat.1]
    this.samples.push(sample);
  }

  // [proj.heat.1]
  computeSnapshot(): HeatSnapshot {
    const now = Date.now();
    // [proj.heat.1]
    const cutoff = now - this.windowMs;

    // [proj.heat.1]
    const lineMap = new Map<string, LineAccumulator>();
    const functionMap = new Map<string, FunctionAccumulator>();

    let totalSamples = 0;

    // [proj.heat.1]
    for (const sample of this.samples) {
      // [proj.heat.1]
      if (sample.timestamp < cutoff) {
        continue;
      }

      totalSamples++;

      // [proj.heat.1]
      for (const frame of sample.frames) {
        const lineKey = `${frame.scriptUrl}:${frame.lineNumber}`;

        // [proj.heat.1]
        let lineAcc = lineMap.get(lineKey);
        if (!lineAcc) {
          lineAcc = {
            scriptUrl: frame.scriptUrl,
            lineNumber: frame.lineNumber,
            hitCount: 0,
            totalSelfTimeMs: 0,
            maxSelfTimeMs: 0,
          };
          lineMap.set(lineKey, lineAcc);
        }

        // [proj.heat.1]
        lineAcc.hitCount += frame.hitCount;
        lineAcc.totalSelfTimeMs += frame.selfTimeMs;
        lineAcc.maxSelfTimeMs = Math.max(lineAcc.maxSelfTimeMs, frame.selfTimeMs);

        // Track functions
        if (frame.functionName) {
          const funcKey = `${frame.scriptUrl}:${frame.lineNumber}:${frame.functionName}`;
          let funcAcc = functionMap.get(funcKey);
          if (!funcAcc) {
            funcAcc = {
              name: frame.functionName,
              scriptUrl: frame.scriptUrl,
              lineNumber: frame.lineNumber,
              totalSelfTimeMs: 0,
            };
            functionMap.set(funcKey, funcAcc);
          }
          funcAcc.totalSelfTimeMs += frame.selfTimeMs;
        }
      }
    }

    // [proj.heat.1]
    let globalMaxHits = 0;
    for (const acc of lineMap.values()) {
      globalMaxHits = Math.max(globalMaxHits, acc.hitCount);
    }
    if (globalMaxHits === 0) globalMaxHits = 1;

    // [proj.heat.1]
    const fileMap = new Map<string, FileHeat>();

    // [proj.heat.1]
    for (const [lineKey, acc] of lineMap.entries()) {
      // [proj.heat.1]
      const heatScore = acc.hitCount / globalMaxHits;
      const avgSelfTimeMs = acc.totalSelfTimeMs / (acc.hitCount || 1);

      const lineHeat: LineHeat = {
        scriptUrl: acc.scriptUrl,
        lineNumber: acc.lineNumber,
        totalHits: acc.hitCount,
        avgSelfTimeMs,
        maxSelfTimeMs: acc.maxSelfTimeMs,
        heatScore,
      };

      // [proj.heat.1]
      let fileHeat = fileMap.get(acc.scriptUrl);
      if (!fileHeat) {
        fileHeat = {
          scriptUrl: acc.scriptUrl,
          displayPath: this.extractDisplayPath(acc.scriptUrl),
          lines: new Map(),
          maxHeat: 0,
          totalHits: 0,
          fileScore: 0,
        };
        fileMap.set(acc.scriptUrl, fileHeat);
      }

      // [proj.heat.1]
      fileHeat.lines.set(acc.lineNumber, lineHeat);
      fileHeat.totalHits += acc.hitCount;
      fileHeat.maxHeat = Math.max(fileHeat.maxHeat, heatScore);
    }

    // [proj.heat.1]
    for (const fileHeat of fileMap.values()) {
      fileHeat.fileScore = fileHeat.maxHeat;
    }

    // [proj.heat.1]
    const topFunctions = Array.from(functionMap.values())
      .sort((a, b) => b.totalSelfTimeMs - a.totalSelfTimeMs)
      .slice(0, 10)
      .map((f) => ({
        name: f.name,
        selfTimeMs: f.totalSelfTimeMs,
        scriptUrl: f.scriptUrl,
        lineNumber: f.lineNumber,
      }));

    // [proj.heat.1]
    return {
      sessionId: this.samples.length > 0 ? this.samples[0].sessionId : '',
      timestamp: now,
      files: fileMap,
      topFunctions,
      totalSamples,
    };
  }

  // [proj.heat.1]
  clear(): void {
    this.samples = [];
  }

  // [proj.heat.1]
  getSampleCount(): number {
    return this.samples.length;
  }

  private extractDisplayPath(scriptUrl: string): string {
    if (scriptUrl.startsWith('file://')) {
      const filePath = scriptUrl.substring(7);
      const parts = filePath.split('/');
      return parts.length > 3 ? parts.slice(-3).join('/') : filePath;
    }
    return scriptUrl;
  }
}
