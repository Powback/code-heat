// [proj.cdp.1]
// Chrome DevTools Protocol client for V8 profiler access

import { EventEmitter } from 'events';
import CDP from 'chrome-remote-interface';

// [proj.cdp.1]
export class CdpClient extends EventEmitter {
  private client: any;

  // [proj.cdp.1]
  constructor() {
    super();
    this.client = null;
  }

  // [proj.cdp.1]
  async connect(host: string, port: number): Promise<void> {
    try {
      // [proj.cdp.1]
      this.client = await CDP({ host, port });

      // [proj.cdp.1]
      await this.client.Runtime.enable();
      // [proj.cdp.1]
      await this.client.Debugger.enable();
      // [proj.cdp.1]
      await this.client.Profiler.enable();
    } catch (err) {
      // [proj.cdp.1]
      throw new Error(`CDP connection failed to ${host}:${port} - ${err.message}`);
    }
  }

  // [proj.cdp.1]
  async startProfiling(intervalUs: number): Promise<void> {
    if (!this.client) {
      throw new Error('CDP client not connected');
    }

    try {
      // [proj.cdp.1]
      await this.client.Profiler.setSamplingInterval({ interval: intervalUs });
      // [proj.cdp.1]
      await this.client.Profiler.start();
    } catch (err) {
      // [proj.cdp.1]
      throw new Error(`Failed to start profiling: ${err.message}`);
    }
  }

  // [proj.cdp.1]
  async stopProfiling(): Promise<any> {
    if (!this.client) {
      throw new Error('CDP client not connected');
    }

    try {
      // [proj.cdp.1]
      const result = await this.client.Profiler.stop();
      // [proj.cdp.1]
      return result.profile;
    } catch (err) {
      // [proj.cdp.1]
      throw new Error(`Failed to stop profiling: ${err.message}`);
    }
  }

  // [proj.cdp.1]
  async getScriptSource(scriptId: string): Promise<string> {
    if (!this.client) {
      throw new Error('CDP client not connected');
    }

    try {
      // [proj.cdp.1]
      const result = await this.client.Debugger.getScriptSource({ scriptId });
      // [proj.cdp.1]
      return result.scriptSource;
    } catch (err) {
      // [proj.cdp.1]
      throw new Error(`Failed to get script source for ${scriptId}: ${err.message}`);
    }
  }

  // [proj.cdp.1]
  onScriptParsed(callback: (scriptId: string, scriptUrl: string) => void): void {
    if (!this.client) {
      throw new Error('CDP client not connected');
    }

    // [proj.cdp.1]
    this.client.Debugger.on('scriptParsed', (params: any) => {
      callback(params.scriptId, params.url);
    });
  }

  // [proj.cdp.1]
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        // [proj.cdp.1]
        await this.client.close();
      } catch (err) {
        // [proj.cdp.1]
        console.warn('Error during CDP disconnect:', err);
      }
      // [proj.cdp.1]
      this.client = null;
    }
  }
}
