**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/agent.ts

# ProfilerAgent Class [proj.agent.1]

Define `ProfilerAgent` class extending EventEmitter as the main orchestrator.

## Constructor [proj.agent.1]

- Signature: `constructor(config: ProfilerConfig)`
- Store config
- Initialize internal state: session (undefined), all component instances (undefined)

## attach Method [proj.agent.1]

- Signature: `attach(target: string): Promise<void>`
- Parse target string: if numeric, treat as PID; otherwise parse as 'host:port'
- Generate new session UUID
- Look up or resolve target name (e.g., process name for PID, hostname:port)
- Create ProfilingSession object with id, target, targetName, startedAt=Date.now(), totalSamples=0, status='active'
- Instantiate CdpClient and call connect(host, port)
- Instantiate SourceMapper
- Instantiate HeatAccumulator
- Instantiate Sampler
- Instantiate WsServer
- Call wsServer.start()
- Call wsServer.broadcastSessionStart(session)
- Register Sampler 'sample' event listener:
  - Feed sample to heatAccumulator.addSample()
  - Broadcast sample via wsServer.broadcastSample()
  - Increment session.totalSamples
- Register snapshot interval logic (alternative to Sampler internal interval, or use Sampler's interval):
  - Call heatAccumulator.computeSnapshot() every config.snapshotIntervalMs
  - Broadcast snapshot via wsServer.broadcastSnapshot()
  - Persist snapshot to heatStore (if available)
- Register error listeners on all components and emit agent errors
- Update session.status to 'active'

## detach Method [proj.agent.1]

- Signature: `detach(): Promise<void>`
- Stop Sampler: call sampler.stop()
- Stop WsServer: call wsServer.close()
- Dispose SourceMapper: call sourceMapper.dispose()
- Disconnect CDP: call cdpClient.disconnect()
- Update session.status to 'stopped', set session.endedAt to Date.now()
- Broadcast session_end via wsServer (if still open, wrap in try-catch)
- Clear internal references

## getSnapshot Method [proj.agent.1]

- Signature: `getSnapshot(): HeatSnapshot`
- Call heatAccumulator.computeSnapshot()
- Return result

## Event Emissions [proj.agent.1]

- `'snapshot'` event with `HeatSnapshot` payload: emitted whenever snapshot is computed
- `'error'` event with `Error` payload: propagated from any component

## Error Handling [proj.agent.1]

- Catch errors from attach() and update session.status to 'error' with error message
- Ensure detach() is called even if attach() fails (cleanup attempt)