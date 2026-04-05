**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/server.ts

# Standalone Server [proj.server.1]

## Environment Configuration [proj.server.1]

- Read `TARGET_HOST` env var (required): hostname of target Node.js process
- Read `TARGET_PORT` env var (required): numeric port of target CDP
- Read `WS_PORT` env var (optional, default: '7700'): WebSocket server port
- Read `SAMPLE_INTERVAL_US` env var (optional, default: '100'): CDP sampling interval in microseconds
- Read `SNAPSHOT_INTERVAL_MS` env var (optional, default: '500'): snapshot computation interval in milliseconds
- Read `REDIS_URL` env var (optional): Redis URL for distributed caching
- Read `VERBOSE` env var (optional, default: 'false'): debug logging flag (true if 'true' or '1')

## Startup Sequence [proj.server.1]

- Construct ProfilerConfig from environment variables
- Instantiate ProfilerAgent with config
- Call `agent.attach(TARGET_HOST:TARGET_PORT)` as promise
- Log startup info: "Profiler Agent attached to {target}, WS server on {wsPort}"
- Handle attach errors: log fatal error and exit with code 1

## Graceful Shutdown [proj.server.1]

- Register SIGINT handler: log "Shutting down...", call `agent.detach()`, exit with code 0
- Register SIGTERM handler: same as SIGINT
- Ensure agent cleanup completes before process exit

## Logging [proj.server.1]

- If config.verbose is true, log debug messages for major operations:
  - Connection attempts
  - Profiler started/stopped
  - Sample received
  - Snapshot computed
  - WebSocket connections/disconnections
- Use console.log or a structured logger
- Always log errors and startup/shutdown milestones to stderr

## Error Handling [proj.server.1]

- Wrap startup in try-catch; log and exit if attach fails
- Register uncaught exception handler: log error and exit with code 1
- Register unhandled rejection handler: log error and exit with code 1