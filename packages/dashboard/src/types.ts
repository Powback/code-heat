// [types.imports.1]
export type {
  LineHeat,
  FileHeat,
  HeatSnapshot,
  ProfilingSession,
  SessionSummary,
  WsMessage,
  WsMessageType,
} from '@code-heat/profiler';

// [types.lineheat.1]
export interface LineHeat {
  lineNumber: number;
  hits: number;
  totalTime: number;
  averageTime: number;
  maxTime: number;
}

// [types.fileheat.1]
export interface FileHeat {
  filePath: string;
  lines: Map<number, LineHeat>;
  totalHits: number;
  maxScore: number;
}

// [types.decoration.1]
export interface HeatmapDecoration {
  lineNumber: number;
  colorClass: string;
  tooltipText: string;
}

// [types.filetreenode.1]
export interface FileTreeNode {
  displayPath: string;
  fileScore: number;
  lineCount: number;
  isHot: boolean;
  scriptUrl: string;
}

// [types.dashstate.1]
export interface DashboardState {
  currentSession: ProfilingSession | undefined;
  snapshot: HeatSnapshot | undefined;
  subscribedFile: string | undefined;
  isConnected: boolean;
  wsUrl: string;
}

// [types.constants.1]
export const HEAT_SCORE_THRESHOLDS = {
  cool: 0.2,
  warm: 0.4,
  hot: 0.6,
  veryHot: 0.8,
} as const;
