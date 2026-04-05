**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/source-mapper.ts

# SourceMapper Class [proj.srcmap.1]

Define `SourceMapper` class for resolving JavaScript locations to original TypeScript sources.

## Constructor [proj.srcmap.1]

- Initialize with no parameters
- Set up internal cache: `Map<scriptUrl, SourceMapConsumer>`

## loadSourceMap Method [proj.srcmap.1]

- Signature: `loadSourceMap(scriptUrl: string, scriptContent: string): Promise<void>`
- Check if scriptUrl is already cached; return early if so
- Search scriptContent for `//# sourceMappingURL=` comment
- If inline base64 data URI found, decode and parse as JSON
- If file path found (relative or absolute), attempt to fetch the .map file from the same directory
- On successful parse, instantiate `new SourceMapConsumer(map)` from `source-map` package and cache it
- On parse failure or unavailable map, log warning but do not throw; treat as unmapped
- Cache the consumer (or null if unmapped) to prevent re-attempts

## resolve Method [proj.srcmap.1]

- Signature: `resolve(scriptUrl: string, line: number, column: number): {sourceUrl: string; line: number; column: number}`
- Retrieve cached SourceMapConsumer for scriptUrl
- If found, call `consumer.originalPositionFor({line, column})` and return result if valid (non-negative)
- If not found or invalid position, return original input: `{sourceUrl: scriptUrl, line, column}`
- Ensure line and column are always positive integers

## resolveFrame Method [proj.srcmap.1]

- Signature: `resolveFrame(frame: CallFrame): CallFrame`
- Call `resolve()` using frame's scriptUrl, lineNumber, columnNumber
- Return new CallFrame with:
  - `scriptUrl` replaced by resolved sourceUrl
  - `lineNumber` and `columnNumber` replaced by resolved values
  - All other properties (functionName, selfTimeMs, totalTimeMs, hitCount) preserved unchanged

## dispose Method [proj.srcmap.1]

- Signature: `dispose(): void`
- Iterate cache and call `.destroy()` on each SourceMapConsumer
- Clear the cache map
- Use this to clean up resources before shutdown

## Error Handling [proj.srcmap.1]

- Wrap all source-map library calls in try-catch
- Log errors to console.warn but do not propagate; default to unmapped location
- All public methods must be non-throwing