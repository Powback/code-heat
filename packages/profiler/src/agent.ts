// [proj.agent.1]
// Main profiler agent orchestrator

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { CdpClient } from './cdp-client.js';
import { SourceMapper } from './source-mapper.js';
import { HeatAccumulator } from './heat-calculator.js';
import { Sampler } from './sampler.js';
import { WsServer } from './ws-server.js';
import { HeatStore } from './store.js';
import type { ProfilerConfig, ProfilingSession, HeatSnapshot } from './types.js';

// [proj.agent.1]
export class ProfilerAgent extends EventEmitter {
  private config: ProfilerConfig;
  private session?: ProfilingSession;
  private cdpClient?: CdpClient;
  private sourceMapper?: SourceMapper;
  private heatAccumulator?: HeatAccumulator;
  private sampler?: Sampler;
  private wsServer?: WsServer;
  private heatStore?: HeatStore;
  private snapshotInterval?: NodeJS.Timeout;

  // [proj.agent.1]
  constructor(config: ProfilerConfig) {
    super();
    // [proj.agent.1]
    this.config = config;
  }

  // [proj.agent.1]
  async attach(target: string): Promise<void> {
    try {
      // [proj.agent.1]
      const { host, port, targetName } = this.parseTarget(target);

      // [proj.agent.1]
      const sessionId = randomUUID();
      // [proj.agent.1]
      this.session = {
        id: sessionId,
        target,
        targetName,
        startedAt: Date.now(),
        totalSamples: 0,
        status: 'active',
      };

      // [proj.agent.1]
      this.cdpClient = new CdpClient();
      await this.cdpClient.connect(host, port);

      // [proj.agent.1]
      this.sourceMapper = new SourceMapper();

      // [proj.agent.1]
      this.heatAccumulator = new HeatAccumulator(30000);

      // [proj.agent.1]
      this.sampler = new Sampler(this.cdpClient, this.sourceMapper, this.config);

      // [proj.agent.1]
      this.wsServer = new WsServer(this.config.wsPort ?? 7700);
      // [proj.agent.1]
      await this.wsServer.start();

      // [proj.agent.1]
      this.wsServer.broadcastSessionStart(this.session);

      // [proj.agent.1]
      this.heatStore = new HeatStore();
      await this.heatStore.saveSession(this.session);

      // [proj.agent.1]
      this.sampler.on('sample', (sample) => {
        if (!this.heatAccumulator || !this.wsServer || !this.session) return;

        // [proj.agent.1]
        this.heatAccumulator.addSample(sample);
        // [proj.agent.1]
        this.wsServer.broadcastSample(sample);
        // [proj.agent.1]
        this.session.totalSamples++;
      });

      // [proj.agent.1]
      this.sampler.on('error', (err) => {
        this.emit('error', err);
      });

      // [proj.agent.1]
      this.snapshotInterval = setInterval(async () => {
        if (!this.heatAccumulator || !this.wsServer || !this.heatStore) return;

        try {
          // [proj.agent.1]
          const snapshot = this.heatAccumulator.computeSnapshot();
          // [proj.agent.1]
          this.wsServer.broadcastSnapshot(snapshot);
          // [proj.agent.1]
          await this.heatStore.saveSnapshot(snapshot);
          // [proj.agent.1]
          this.emit('snapshot', snapshot);
        } catch (err) {
          this.emit('error', err);
        }
      }, this.config.snapshotIntervalMs ?? 500);

      await this.sampler.start(sessionId);

      // [proj.agent.1]
      this.session.status = 'active';

      if (this.config.verbose) {
        console.log(`Profiler attached to ${targetName} (${target})`);
      }
    } catch (err) {
      // [proj.agent.1]
      if (this.session) {
        this.session.status = 'error';
        this.session.error = err instanceof Error ? err.message : String(err);
      }
      // [proj.agent.1]
      await this.detach();
      throw err;
    }
  }

  // [proj.agent.1]
  async detach(): Promise<void> {
    // [proj.agent.1]
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = undefined;
    }

    // [proj.agent.1]
    if (this.sampler) {
      try {
        await this.sampler.stop();
      } catch (err) {
        console.warn('Error stopping sampler:', err);
      }
    }

    // [proj.agent.1]
    if (this.sourceMapper) {
      this.sourceMapper.dispose();
    }

    // [proj.agent.1]
    if (this.cdpClient) {
      try {
        await this.cdpClient.disconnect();
      } catch (err) {
        console.warn('Error disconnecting CDP:', err);
      }
    }

    // [proj.agent.1]
    if (this.session) {
      this.session.status = 'stopped';
      this.session.endedAt = Date.now();

      // [proj.agent.1]
      if (this.wsServer) {
        try {
          this.wsServer.broadcastSessionEnd({
            id: this.session.id,
            target: this.session.target,
            targetName: this.session.targetName,
            startedAt: this.session.startedAt,
            endedAt: this.session.endedAt,
            status: this.session.status,
          });
        } catch (err) {
          console.warn('Error broadcasting session end:', err);
        }
      }

      if (this.heatStore) {
        try {
          await this.heatStore.updateSession(this.session);
        } catch (err) {
          console.warn('Error updating session in store:', err);
        }
      }
    }

    // [proj.agent.1]
    if (this.wsServer) {
      try {
        await this.wsServer.close();
      } catch (err) {
        console.warn('Error closing WebSocket server:', err);
      }
    }

    // [proj.agent.1]
    this.cdpClient = undefined;
    this.sourceMapper = undefined;
    this.heatAccumulator = undefined;
    this.sampler = undefined;
    this.wsServer = undefined;
    this.heatStore = undefined;
  }

  // [proj.agent.1]
  getSnapshot(): HeatSnapshot {
    if (!this.heatAccumulator) {
      throw new Error('Profiler not attached');
    }
    // [proj.agent.1]
    return this.heatAccumulator.computeSnapshot();
  }

  // [proj.agent.1]
  private parseTarget(target: string): { host: string; port: number; targetName: string } {
    // [proj.agent.1]
    if (/^\d+$/.test(target)) {
      const pid = parseInt(target, 10);
      return {
        host: 'localhost',
        port: 9229,
        targetName: `pid:${pid}`,
      };
    }

    // [proj.agent.1]
    const parts = target.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid target format: ${target}. Expected 'host:port' or 'pid'`);
    }

    const host = parts[0];
    const port = parseInt(parts[1], 10);

    if (isNaN(port)) {
      throw new Error(`Invalid port in target: ${target}`);
    }

    return {
      host,
      port,
      targetName: `${host}:${port}`,
    };
  }
}
