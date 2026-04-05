// [proj.sampler.1]
// Continuous V8 profiling sampler with EventEmitter interface

import { EventEmitter } from 'events';
import type { CdpClient } from './cdp-client.js';
import type { SourceMapper } from './source-mapper.js';
import type { ProfilerConfig, ProfileSample, CallFrame } from './types.js';

interface V8ProfileNode {
  id: number;
  callFrame: {
    functionName: string;
    scriptId: string;
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
  hitCount: number;
  children?: number[];
}

interface V8Profile {
  nodes: V8ProfileNode[];
  startTime: number;
  endTime: number;
  samples?: number[];
  timeDeltas?: number[];
}

// [proj.sampler.1]
export class Sampler extends EventEmitter {
  private cdpClient: CdpClient;
  private sourceMapper: SourceMapper;
  private config: ProfilerConfig;
  private intervalHandle?: NodeJS.Timeout;
  private active: boolean;

  // [proj.sampler.1]
  constructor(cdpClient: CdpClient, sourceMapper: SourceMapper, config: ProfilerConfig) {
    super();
    // [proj.sampler.1]
    this.cdpClient = cdpClient;
    this.sourceMapper = sourceMapper;
    this.config = config;
    // [proj.sampler.1]
    this.active = false;
  }

  // [proj.sampler.1]
  async start(sessionId: string): Promise<void> {
    // [proj.sampler.1]
    await this.cdpClient.startProfiling(this.config.sampleIntervalUs ?? 100);
    this.active = true;

    // [proj.sampler.1]
    this.intervalHandle = setInterval(async () => {
      try {
        // [proj.sampler.1]
        const profile: V8Profile = await this.cdpClient.stopProfiling();
        // [proj.sampler.1]
        await this.cdpClient.startProfiling(this.config.sampleIntervalUs ?? 100);

        // [proj.sampler.1]
        const frames = this.parseV8Profile(profile);
        // [proj.sampler.1]
        const resolvedFrames = frames.map((f) => this.sourceMapper.resolveFrame(f));

        // [proj.sampler.1]
        const sample: ProfileSample = {
          sessionId,
          timestamp: Date.now(),
          frames: resolvedFrames,
        };

        // [proj.sampler.1]
        this.emit('sample', sample);
      } catch (err) {
        // [proj.sampler.1]
        this.emit('error', err);
      }
    }, this.config.snapshotIntervalMs ?? 500);
  }

  // [proj.sampler.1]
  async stop(): Promise<void> {
    // [proj.sampler.1]
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }

    try {
      // [proj.sampler.1]
      await this.cdpClient.stopProfiling();
    } catch (err) {
      // [proj.sampler.1]
      console.warn('Error stopping profiler:', err);
    }

    // [proj.sampler.1]
    this.active = false;
  }

  // [proj.sampler.1]
  private parseV8Profile(profile: V8Profile): CallFrame[] {
    const frames: CallFrame[] = [];
    const nodeMap = new Map<number, V8ProfileNode>();

    // [proj.sampler.1]
    for (const node of profile.nodes) {
      nodeMap.set(node.id, node);
    }

    // [proj.sampler.1]
    const intervalMs = (this.config.sampleIntervalUs ?? 100) / 1000;

    // [proj.sampler.1]
    for (const node of profile.nodes) {
      if (node.hitCount > 0) {
        // [proj.sampler.1]
        const selfTimeMs = node.hitCount * intervalMs;

        // [proj.sampler.1]
        const frame: CallFrame = {
          scriptUrl: node.callFrame.url || `script:${node.callFrame.scriptId}`,
          lineNumber: node.callFrame.lineNumber + 1,
          columnNumber: node.callFrame.columnNumber,
          functionName: node.callFrame.functionName || '(anonymous)',
          selfTimeMs,
          totalTimeMs: selfTimeMs,
          hitCount: node.hitCount,
        };

        frames.push(frame);
      }

      // [proj.sampler.1]
      if (node.children) {
        for (const childId of node.children) {
          const child = nodeMap.get(childId);
          if (child && child.hitCount > 0) {
            const childFrame = frames.find(
              (f) =>
                f.scriptUrl === (child.callFrame.url || `script:${child.callFrame.scriptId}`) &&
                f.lineNumber === child.callFrame.lineNumber + 1
            );
            if (childFrame) {
              childFrame.totalTimeMs += child.hitCount * intervalMs;
            }
          }
        }
      }
    }

    return frames;
  }
}
