**Type:** Dockerfile Build Configuration
**Output:** packages/profiler/Dockerfile

# Profiler Multi-Stage Dockerfile

## Build Stage
[proj.docker.prof.1.1] Base image: node:22-alpine (lightweight Node.js runtime)
[proj.docker.prof.1.2] Working directory: /app
[proj.docker.prof.1.3] Copy package.json into build stage
[proj.docker.prof.1.4] Run npm install (or pnpm install) to install dependencies
[proj.docker.prof.1.5] Copy source directory src/ into build stage
[proj.docker.prof.1.6] Run npx tsc to compile TypeScript to dist/

## Production Stage
[proj.docker.prof.1.7] Base image: node:22-alpine (same as build stage)
[proj.docker.prof.1.8] Working directory: /app
[proj.docker.prof.1.9] Copy --from=build dist/ and node_modules/ from build stage
[proj.docker.prof.1.10] Expose ports 7700 (WebSocket) and 7701 (HTTP) in container
[proj.docker.prof.1.11] Default command: node dist/server.js (start profiler server)
[proj.docker.prof.1.12] Production stage should not include TypeScript compiler or build tools