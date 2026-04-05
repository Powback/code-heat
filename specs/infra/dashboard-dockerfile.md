**Type:** Dockerfile Build Configuration
**Output:** packages/dashboard/Dockerfile

# Dashboard Multi-Stage Dockerfile (Astro)

## Build Stage
[proj.docker.dash.1.1] Base image: node:22-alpine (Node.js 22 on Alpine Linux)
[proj.docker.dash.1.2] Working directory: /app
[proj.docker.dash.1.3] Copy package.json and install all dependencies (including dev dependencies)
[proj.docker.dash.1.4] Copy full source tree including astro.config.ts, src/, and tsconfig.json
[proj.docker.dash.1.5] Run `astro build` to statically generate site into dist/

## Production Stage
[proj.docker.dash.1.6] Base image: node:22-alpine
[proj.docker.dash.1.7] Working directory: /app
[proj.docker.dash.1.8] Copy --from=build dist/ (compiled Astro output) into production stage
[proj.docker.dash.1.9] Expose port 4321 (Astro default development server port)
[proj.docker.dash.1.10] Default command: `node dist/server/entry.mjs` (Astro's server entry point for SSR)
[proj.docker.dash.1.11] Production stage includes only dist/ directory; no source or build tools