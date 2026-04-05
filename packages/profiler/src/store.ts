// [proj.store.1]
// PowSync data persistence layer for profiling data

// [proj.store.1]
import { table, field, pk, serverStore } from '../../../PowSync/src/server-entry.js';
import { randomUUID } from 'crypto';
import type { ProfilingSession, SessionSummary, HeatSnapshot, FileHeat } from './types.js';

// [proj.store.1]
@table('profiling_sessions')
class ProfilingSessionRecord {
  // [proj.store.1]
  @pk id!: string;
  // [proj.store.1]
  @field target!: string;
  // [proj.store.1]
  @field targetName!: string;
  // [proj.store.1]
  @field startedAt!: number;
  // [proj.store.1]
  @field endedAt?: number;
  // [proj.store.1]
  @field totalSamples!: number;
  // [proj.store.1]
  @field status!: string;
  // [proj.store.1]
  @field topFile?: string;
  // [proj.store.1]
  @field topScore?: number;
}

// [proj.store.1]
@table('line_heat_snapshots')
class LineHeatRecord {
  // [proj.store.1]
  @pk id!: string;
  // [proj.store.1]
  @field sessionId!: string;
  // [proj.store.1]
  @field scriptUrl!: string;
  // [proj.store.1]
  @field lineNumber!: number;
  // [proj.store.1]
  @field heatScore!: number;
  // [proj.store.1]
  @field hitCount!: number;
  // [proj.store.1]
  @field avgSelfTimeMs!: number;
  // [proj.store.1]
  @field snapshotAt!: number;
}

// [proj.store.1]
export class HeatStore {
  // [proj.store.1]
  async saveSession(session: ProfilingSession): Promise<void> {
    // [proj.store.1]
    const record = new ProfilingSessionRecord();
    record.id = session.id;
    record.target = session.target;
    record.targetName = session.targetName;
    record.startedAt = session.startedAt;
    record.endedAt = session.endedAt;
    record.totalSamples = session.totalSamples;
    record.status = session.status;

    // [proj.store.1]
    await serverStore.upsert('profiling_sessions', record);
  }

  // [proj.store.1]
  async updateSession(session: ProfilingSession): Promise<void> {
    // [proj.store.1]
    const record = new ProfilingSessionRecord();
    record.id = session.id;
    record.target = session.target;
    record.targetName = session.targetName;
    record.startedAt = session.startedAt;
    record.endedAt = session.endedAt;
    record.totalSamples = session.totalSamples;
    record.status = session.status;

    // [proj.store.1]
    await serverStore.upsert('profiling_sessions', record);
  }

  // [proj.store.1]
  async saveSnapshot(snapshot: HeatSnapshot): Promise<void> {
    // [proj.store.1]
    let topFile: string | undefined;
    let topScore = 0;

    // [proj.store.1]
    for (const [scriptUrl, fileHeat] of snapshot.files.entries()) {
      // [proj.store.1]
      const topLines = Array.from(fileHeat.lines.values())
        .sort((a, b) => b.heatScore - a.heatScore)
        .slice(0, 20);

      // [proj.store.1]
      for (const line of topLines) {
        // [proj.store.1]
        const record = new LineHeatRecord();
        record.id = randomUUID();
        record.sessionId = snapshot.sessionId;
        record.scriptUrl = line.scriptUrl;
        record.lineNumber = line.lineNumber;
        record.heatScore = line.heatScore;
        record.hitCount = line.totalHits;
        record.avgSelfTimeMs = line.avgSelfTimeMs;
        record.snapshotAt = snapshot.timestamp;

        // [proj.store.1]
        await serverStore.upsert('line_heat_snapshots', record);
      }

      if (fileHeat.fileScore > topScore) {
        topScore = fileHeat.fileScore;
        topFile = scriptUrl;
      }
    }

    // [proj.store.1]
    if (topFile) {
      const sessionRecord = new ProfilingSessionRecord();
      sessionRecord.id = snapshot.sessionId;
      sessionRecord.topFile = topFile;
      sessionRecord.topScore = topScore;
      const existingSession = await serverStore.query('profiling_sessions', { id: snapshot.sessionId });
      if (existingSession.length > 0) {
        const existing = existingSession[0] as ProfilingSessionRecord;
        sessionRecord.target = existing.target;
        sessionRecord.targetName = existing.targetName;
        sessionRecord.startedAt = existing.startedAt;
        sessionRecord.endedAt = existing.endedAt;
        sessionRecord.totalSamples = existing.totalSamples;
        sessionRecord.status = existing.status;
        await serverStore.upsert('profiling_sessions', sessionRecord);
      }
    }
  }

  // [proj.store.1]
  async getSessions(): Promise<SessionSummary[]> {
    // [proj.store.1]
    const records = await serverStore.query('profiling_sessions', {});

    // [proj.store.1]
    return records.map((r: any) => ({
      id: r.id,
      target: r.target,
      targetName: r.targetName,
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      status: r.status as 'active' | 'stopped' | 'error',
    }));
  }

  // [proj.store.1]
  async getSessionHeat(sessionId: string): Promise<Map<string, FileHeat>> {
    // [proj.store.1]
    const records = await serverStore.query('line_heat_snapshots', { sessionId });

    // [proj.store.1]
    const fileMap = new Map<string, FileHeat>();

    // [proj.store.1]
    for (const record of records) {
      const r = record as LineHeatRecord;
      // [proj.store.1]
      let fileHeat = fileMap.get(r.scriptUrl);
      if (!fileHeat) {
        fileHeat = {
          scriptUrl: r.scriptUrl,
          displayPath: this.extractDisplayPath(r.scriptUrl),
          lines: new Map(),
          maxHeat: 0,
          totalHits: 0,
          fileScore: 0,
        };
        fileMap.set(r.scriptUrl, fileHeat);
      }

      fileHeat.lines.set(r.lineNumber, {
        scriptUrl: r.scriptUrl,
        lineNumber: r.lineNumber,
        totalHits: r.hitCount,
        avgSelfTimeMs: r.avgSelfTimeMs,
        maxSelfTimeMs: r.avgSelfTimeMs,
        heatScore: r.heatScore,
      });

      fileHeat.totalHits += r.hitCount;
      fileHeat.maxHeat = Math.max(fileHeat.maxHeat, r.heatScore);
    }

    // [proj.store.1]
    for (const fileHeat of fileMap.values()) {
      fileHeat.fileScore = fileHeat.maxHeat;
    }

    return fileMap;
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
