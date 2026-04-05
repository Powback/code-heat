// [proj.server.1]
// Standalone profiler server entry point

import { ProfilerAgent } from './agent.js';
import type { ProfilerConfig } from './types.js';

// [proj.server.1]
const TARGET_HOST = process.env.TARGET_HOST;
const TARGET_PORT = process.env.TARGET_PORT;
// [proj.server.1]
const WS_PORT = process.env.WS_PORT ?? '7700';
// [proj.server.1]
const SAMPLE_INTERVAL_US = process.env.SAMPLE_INTERVAL_US ?? '100';
// [proj.server.1]
const SNAPSHOT_INTERVAL_MS = process.env.SNAPSHOT_INTERVAL_MS ?? '500';
// [proj.server.1]
const REDIS_URL = process.env.REDIS_URL;
// [proj.server.1]
const VERBOSE = process.env.VERBOSE === 'true' || process.env.VERBOSE === '1';

// [proj.server.1]
if (!TARGET_HOST || !TARGET_PORT) {
  console.error('ERROR: TARGET_HOST and TARGET_PORT environment variables are required');
  process.exit(1);
}

// [proj.server.1]
const config: ProfilerConfig = {
  targetHost: TARGET_HOST,
  targetPort: parseInt(TARGET_PORT, 10),
  wsPort: parseInt(WS_PORT, 10),
  sampleIntervalUs: parseInt(SAMPLE_INTERVAL_US, 10),
  snapshotIntervalMs: parseInt(SNAPSHOT_INTERVAL_MS, 10),
  redisUrl: REDIS_URL,
  verbose: VERBOSE,
};

// [proj.server.1]
const agent = new ProfilerAgent(config);

// [proj.server.1]
const target = `${config.targetHost}:${config.targetPort}`;

// [proj.server.1]
async function startup() {
  try {
    // [proj.server.1]
    await agent.attach(target);
    // [proj.server.1]
    console.log(`Profiler Agent attached to ${target}, WS server on ${config.wsPort}`);

    if (config.verbose) {
      console.log('Configuration:', {
        target,
        wsPort: config.wsPort,
        sampleIntervalUs: config.sampleIntervalUs,
        snapshotIntervalMs: config.snapshotIntervalMs,
      });
    }
  } catch (err) {
    // [proj.server.1]
    console.error('FATAL: Failed to attach profiler agent:', err);
    process.exit(1);
  }
}

// [proj.server.1]
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  // [proj.server.1]
  await agent.detach();
  // [proj.server.1]
  process.exit(0);
});

// [proj.server.1]
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  // [proj.server.1]
  await agent.detach();
  // [proj.server.1]
  process.exit(0);
});

// [proj.server.1]
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // [proj.server.1]
  process.exit(1);
});

// [proj.server.1]
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // [proj.server.1]
  process.exit(1);
});

// [proj.server.1]
startup();
