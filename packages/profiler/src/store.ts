// [proj.store.1]
// In-memory heat store with optional PowSync persistence.
// PowSync integration is enabled when Redis URL is configured (future work).

import { randomUUID } from 'crypto';
import type { ProfilingSession, SessionSummary, HeatSnapshot, FileHeat, LineHeat } from './types.js';

// [proj.store.1]
interface StoredSession {
  session: ProfilingSession;
  topFile?: string;
  topScore?: number;
}

// [proj.store.1]
interface StoredLineHeat {
  id: string;
  sessionId: string;
  scriptUrl: string;
  lineNumber: number;
  heatScore: number;
  hitCount: number;
  avgSelfTimeMs: number;
  snapshotAt: number;
}

// [proj.store.1]
export class HeatStore {
  private sessions = new Map<string, StoredSession>();
  private lineHeats = new Map<string, StoredLineHeat[]>(); // sessionId → records

  // [proj.store.1]
  async saveSession(session: ProfilingSession): Promise<void> {
    // [proj.store.1]
    this.sessions.set(session.id, { session: { ...session } });
  }

  // [proj.store.1]
  async updateSession(session: ProfilingSession): Promise<void> {
    // [proj.store.1]
    const existing = this.sessions.get(session.id);
    if (existing) {
      existing.session = { ...session };
    } else {
      this.sessions.set(session.id, { session: { ...session } });
    }
  }

  // [proj.store.1]
  async saveSnapshot(snapshot: HeatSnapshot): Promise<void> {
    // [proj.store.1]
    let topFile: string | undefined;
    let topScore = 0;
    const records: StoredLineHeat[] = [];

    // [proj.store.1]
    for (const [scriptUrl, fileHeat] of snapshot.files.entries()) {
      // [proj.store.1]
      const topLines = Array.from(fileHeat.lines.values())
        .sort((a, b) => b.heatScore - a.heatScore)
        .slice(0, 20);

      // [proj.store.1]
      for (const line of topLines) {
        records.push({
          id: randomUUID(),
          sessionId: snapshot.sessionId,
          scriptUrl: line.scriptUrl,
          lineNumber: line.lineNumber,
          heatScore: line.heatScore,
          hitCount: line.totalHits,
          avgSelfTimeMs: line.avgSelfTimeMs,
          snapshotAt: snapshot.timestamp,
        });
      }

      if (fileHeat.fileScore > topScore) {
        topScore = fileHeat.fileScore;
        topFile = scriptUrl;
      }
    }

    // [proj.store.1]
    const existing = this.lineHeats.get(snapshot.sessionId) ?? [];
    this.lineHeats.set(snapshot.sessionId, [...existing, ...records]);

    // [proj.store.1]
    if (topFile) {
      const stored = this.sessions.get(snapshot.sessionId);
      if (stored) {
        stored.topFile = topFile;
        stored.topScore = topScore;
      }
    }
  }

  // [proj.store.1]
  async getSessions(): Promise<SessionSummary[]> {
    // [proj.store.1]
    return Array.from(this.sessions.values()).map(({ session, topFile, topScore }) => ({
      id: session.id,
      target: session.target,
      targetName: session.targetName,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      totalSamples: session.totalSamples,
      status: session.status,
      topFile,
      topScore,
    }));
  }

  // [proj.store.1]
  async getSessionHeat(sessionId: string): Promise<Map<string, FileHeat>> {
    // [proj.store.1]
    const records = this.lineHeats.get(sessionId) ?? [];

    // [proj.store.1]
    const fileMap = new Map<string, FileHeat>();

    // [proj.store.1]
    for (const r of records) {
      let fileHeat = fileMap.get(r.scriptUrl);
      if (!fileHeat) {
        fileHeat = {
          scriptUrl: r.scriptUrl,
          displayPath: this.extractDisplayPath(r.scriptUrl),
          lines: new Map<number, LineHeat>(),
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
