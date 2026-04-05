**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/sampler.ts

# Sampler Class [proj.sampler.1]

Define `Sampler` class extending EventEmitter for continuous V8 profiling.

## Constructor [proj.sampler.1]

- Signature: `constructor(cdpClient: CdpClient, sourceMapper: SourceMapper, config: ProfilerConfig)`
- Store references to cdpClient, sourceMapper, and config
- Initialize internal state: intervalHandle (undefined), active flag (false)

## start Method [proj.sampler.1]

- Signature: `start(sessionId: string): Promise<void>`
- Call `cdpClient.startProfiling(config.sampleIntervalUs)`
- Start an interval loop using `setInterval(async () => { ... }, config.snapshotIntervalMs)`
- In each tick:
  1. Call `cdpClient.stopProfiling()` to get raw V8 profile
  2. Immediately call `cdpClient.startProfiling(config.sampleIntervalUs)` to resume
  3. Parse V8 ProfileNode tree: recursively walk the tree, computing selfTimeMs for each node as `hitCount * (config.sampleIntervalUs / 1000)`
  4. Build CallFrame array from the tree (root to leaf call stacks)
  5. Resolve each frame through `sourceMapper.resolveFrame(frame)`
  6. Construct ProfileSample with sessionId, current timestamp, and resolved frames array
  7. Emit 'sample' event with ProfileSample
- On error, emit 'error' event and do not re-throw
- Store intervalHandle for cleanup

## stop Method [proj.sampler.1]

- Signature: `stop(): Promise<void>`
- Clear the interval if active: `clearInterval(intervalHandle)`
- Call `cdpClient.stopProfiling()` to cleanly shut down the profiler
- Set active flag to false
- Suppress any errors from stopProfiling

## Event Emissions [proj.sampler.1]

- `'sample'` event with `ProfileSample` payload: emitted once per snapshot interval
- `'error'` event with `Error` payload: emitted on any error without throwing