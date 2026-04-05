// [proj.types.1]
// Core type definitions for the heat profiler system

// [proj.types.1]
export interface CallFrame {
  scriptUrl: string;
  lineNumber: number;
  columnNumber: number;
  functionName: string;
  selfTimeMs: number;
  totalTimeMs: number;
  hitCount: number;
}

// [proj.types.1]
export interface ProfileSample {
  sessionId: string;
  timestamp: number;
  frames: CallFrame[];
}

// [proj.types.1]
export interface LineHeat {
  scriptUrl: string;
  lineNumber: number;
  totalHits: number;
  avgSelfTimeMs: number;
  maxSelfTimeMs: number;
  heatScore: number;
}

// [proj.types.1]
export interface FileHeat {
  scriptUrl: string;
  displayPath: string;
  lines: Map<number, LineHeat>;
  maxHeat: number;
  totalHits: number;
  fileScore: number;
}

// [proj.types.1]
export interface HeatSnapshot {
  sessionId: string;
  timestamp: number;
  files: Map<string, FileHeat>;
  topFunctions: Array<{
    name: string;
    selfTimeMs: number;
    scriptUrl: string;
    lineNumber: number;
  }>;
  totalSamples: number;
}

// [proj.types.1]
export interface ProfilingSession {
  id: string;
  target: string;
  targetName: string;
  startedAt: number;
  endedAt?: number;
  totalSamples: number;
  status: 'active' | 'stopped' | 'error';
  error?: string;
}

// [proj.types.1]
export interface SessionSummary {
  id: string;
  target: string;
  targetName: string;
  startedAt: number;
  endedAt?: number;
  status: 'active' | 'stopped' | 'error';
}

// [proj.types.1]
export interface ProfilerConfig {
  targetHost: string;
  targetPort: number;
  wsPort?: number;
  sampleIntervalUs?: number;
  snapshotIntervalMs?: number;
  redisUrl?: string;
  verbose?: boolean;
}

// [proj.types.1]
export type WsMessageType =
  | 'sample'
  | 'snapshot'
  | 'session_start'
  | 'session_end'
  | 'error'
  | 'subscribe'
  | 'ping'
  | 'pong';

// [proj.types.1]
export interface WsMessage<T> {
  type: WsMessageType;
  sessionId: string;
  payload: T;
}

// [proj.types.1]
export type WsSampleMessage = WsMessage<ProfileSample>;
export type WsSnapshotMessage = WsMessage<HeatSnapshot>;
export type WsSessionStartMessage = WsMessage<ProfilingSession>;
export type WsSessionEndMessage = WsMessage<SessionSummary>;
export type WsErrorMessage = WsMessage<{ code: string; message: string }>;
export type WsSubscribeMessage = WsMessage<{ sessionIds: string[] }>;
