**Type:** JSON Package Configuration
**Output:** packages/profiler/package.json

# Profiler Package Configuration

## Package Metadata
[proj.prof.pkg.1.1] Package name must be "@code-heat/profiler"
[proj.prof.pkg.1.2] Set private flag to true
[proj.prof.pkg.1.3] Module type must be "module" (ES6 modules)

## Scripts
[proj.prof.pkg.1.4] "dev" script: `tsx watch src/server.ts` (watch mode development)
[proj.prof.pkg.1.5] "build" script: `tsc` (compile TypeScript)
[proj.prof.pkg.1.6] "start" script: `node dist/server.js` (run compiled server)
[proj.prof.pkg.1.7] "typecheck" script: `tsc --noEmit` (type checking without emit)

## Runtime Dependencies
[proj.prof.pkg.1.8] chrome-remote-interface: for Chrome DevTools Protocol communication
[proj.prof.pkg.1.9] source-map: for source map parsing and line mapping
[proj.prof.pkg.1.10] ws: for WebSocket server implementation
[proj.prof.pkg.1.11] uuid: for generating unique session IDs

## Development Dependencies
[proj.prof.pkg.1.12] typescript: for type checking and compilation
[proj.prof.pkg.1.13] tsx: for running TypeScript files directly
[proj.prof.pkg.1.14] @types/node: for Node.js type definitions
[proj.prof.pkg.1.15] @types/ws: for WebSocket type definitions
[proj.prof.pkg.1.16] @types/uuid: for UUID utility type definitions