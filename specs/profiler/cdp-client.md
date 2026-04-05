**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/cdp-client.ts

# CdpClient Class [proj.cdp.1]

Define `CdpClient` class extending EventEmitter for Chrome DevTools Protocol communication.

## Constructor [proj.cdp.1]

- Accept no parameters in constructor
- Initialize as EventEmitter
- Set up internal state: protocol client reference, domains enabled flags

## connect Method [proj.cdp.1]

- Signature: `connect(host: string, port: number): Promise<void>`
- Use `chrome-remote-interface` package to establish connection to `ws://host:port/json/list`
- Enable Runtime domain
- Enable Debugger domain
- Enable Profiler domain
- Store protocol client reference for subsequent operations
- Throw if connection fails or any domain fails to enable

## startProfiling Method [proj.cdp.1]

- Signature: `startProfiling(intervalUs: number): Promise<void>`
- Call `Profiler.setSamplingInterval({interval: intervalUs})`
- Call `Profiler.start()`
- Throw if CDP request fails

## stopProfiling Method [proj.cdp.1]

- Signature: `stopProfiling(): Promise<any>`
- Call `Profiler.stop()` which returns raw V8 profile object
- Return the profile object (caller will parse it)
- Throw if CDP request fails

## getScriptSource Method [proj.cdp.1]

- Signature: `getScriptSource(scriptId: string): Promise<string>`
- Call `Debugger.getScriptSource({scriptId})`
- Return the scriptSource string from response
- Throw if scriptId not found or request fails

## onScriptParsed Method [proj.cdp.1]

- Signature: `onScriptParsed(callback: (scriptId: string, scriptUrl: string) => void): void`
- Register callback for `Debugger.scriptParsed` events
- Callback receives scriptId and scriptUrl as parameters
- Allow multiple callbacks via standard EventEmitter pattern

## disconnect Method [proj.cdp.1]

- Signature: `disconnect(): Promise<void>`
- Close the protocol connection gracefully
- Suppress errors during disconnect
- Clear internal client reference

## Error Handling [proj.cdp.1]

- All methods throw descriptive errors if CDP operations fail
- Include error details such as code and message in thrown errors