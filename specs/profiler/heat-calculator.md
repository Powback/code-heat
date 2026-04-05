**Type:** TypeScript (ESM)
**Output:** packages/profiler/src/heat-calculator.ts

# HeatAccumulator Class [proj.heat.1]

Define `HeatAccumulator` class for aggregating raw samples into heat metrics.

## Constructor [proj.heat.1]

- Accept optional `windowMs` parameter (default: 30000)
- Initializes internal sample buffer and timestamp-indexed metadata
- Description: windowMs defines a sliding time window; samples older than current timestamp - windowMs are evicted

## addSample Method [proj.heat.1]

- Signature: `addSample(sample: ProfileSample): void`
- Appends sample to internal buffer
- Records timestamp for window eviction logic
- Does not immediately compute heat; batches for efficiency

## computeSnapshot Method [proj.heat.1]

- Signature: `computeSnapshot(): HeatSnapshot`
- Iterates all samples currently in buffer (within time window)
- For each CallFrame in each sample: accumulate hitCount and selfTimeMs into a (scriptUrl, lineNumber) key
- Normalizes heatScore for each line: `heatScore = totalHits / globalMax` where globalMax is the highest hitCount across all lines
- Constructs FileHeat objects by grouping lines by scriptUrl, computing maxHeat and fileScore per file
- Identifies topFunctions: extracts all unique functions, sorts by selfTimeMs descending, returns top 10
- Returns HeatSnapshot with current timestamp, all FileHeat entries, topFunctions array, and totalSamples count

## clear Method [proj.heat.1]

- Signature: `clear(): void`
- Empties the sample buffer and resets all accumulated state

## getSampleCount Method [proj.heat.1]

- Signature: `getSampleCount(): number`
- Returns the current count of samples in the buffer

## Window Eviction Logic [proj.heat.1]

- During computeSnapshot, silently skip samples with `timestamp < (Date.now() - windowMs)`
- Do not modify the buffer during iteration; defer cleanup to next call or explicit clear()