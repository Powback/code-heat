# code-heat Infrastructure & CLI

CLI tool, Docker configs, sample app, and monorepo scaffolding for code-heat.

**Runtime:** Node.js + TypeScript (ESM)
**Output dir:** (various, see per-file Output paths)

## Files

### cli/src/index.md
**Output:** packages/cli/src/index.ts
Commander CLI for code-heat. Program name `code-heat`, version 0.1.0. Subcommands: `start <target>` (attach profiler to pid or host:port, starts WsServer on 7700, prints dashboard URL), `start --spawn <cmd>` (spawn child with --inspect then attach), `dashboard` (open http://localhost:4321 in browser using `open` package), `record [--duration <time>] <target>` (attach for duration then auto-detach, prints summary), `sessions` (list stored sessions via HeatStore), `analyze <file>` (import existing V8 .cpuprofile JSON file and compute/display heat). Uses chalk for colors, ora for spinners [proj.cli.1].

### cli/package.json.md
**Output:** packages/cli/package.json
CLI package.json: name @code-heat/cli, private, type module, bin: {code-heat: ./src/index.ts}. Scripts: start (tsx src/index.ts), build (tsc). Deps: commander, chalk, ora, open. DevDeps: typescript, tsx, @types/node. Workspace deps: @code-heat/profiler [proj.cli.pkg.1].

### profiler/package.json.md
**Output:** packages/profiler/package.json
Profiler package.json: name @code-heat/profiler, private, type module. Scripts: dev (tsx watch src/server.ts), build (tsc), start (node dist/server.js), typecheck (tsc --noEmit). Deps: chrome-remote-interface, source-map, ws, uuid. DevDeps: typescript, tsx, @types/node, @types/ws, @types/uuid [proj.prof.pkg.1].

### profiler/tsconfig.md
**Output:** packages/profiler/tsconfig.json
TypeScript config: target ES2022, module NodeNext, moduleResolution NodeNext, outDir ./dist, rootDir ./src, strict true, experimentalDecorators true, emitDecoratorMetadata true [proj.prof.tsconfig.1].

### root-package.md
**Output:** package.json
Root monorepo package.json: name code-heat, private true, type module. Scripts: dev (pnpm run --parallel dev --filter './packages/*'), build (pnpm run --recursive build), sample (pnpm --filter sample-app run dev). packageManager pnpm [proj.root.pkg.1].

### pnpm-workspace.md
**Output:** pnpm-workspace.yaml
PNPM workspace file listing packages: ['packages/*', 'sample-app'] [proj.pnpm.1].

### docker-compose.md
**Output:** docker-compose.yml
Docker Compose with 3 services: `dashboard` (build: packages/dashboard, ports 4321:4321, env PROFILER_WS_URL=ws://profiler:7700 PROFILER_HTTP_URL=http://profiler:7701, Traefik labels for code-heat.pow), `profiler` (build: packages/profiler, ports 7700:7700 and 7701:7701, env TARGET_HOST=host.docker.internal TARGET_PORT=9229 REDIS_URL=redis://redis:6379), `redis` (image redis:7-alpine). All on traefik external network [proj.docker.1].

### profiler-dockerfile.md
**Output:** packages/profiler/Dockerfile
Multi-stage Dockerfile: build stage (node:22-alpine, WORKDIR /app, COPY package.json, npm install, COPY src, npx tsc), prod stage (node:22-alpine, COPY --from=build dist and node_modules, CMD node dist/server.js, EXPOSE 7700 7701) [proj.docker.prof.1].

### dashboard-dockerfile.md
**Output:** packages/dashboard/Dockerfile
Multi-stage Dockerfile for Astro: build stage (node:22-alpine, install deps, astro build), prod stage (COPY dist, CMD node dist/server/entry.mjs, EXPOSE 4321) [proj.docker.dash.1].

### sample-app-index.md
**Output:** sample-app/src/index.ts
Sample Node.js HTTP server for testing code-heat. Uses Node `http` module (no frameworks). Routes: GET `/` serves HTML page with links to test endpoints, GET `/fibonacci?n=<N>` computes fibonacci(N) recursively (deliberately slow), GET `/sort?size=<N>` creates and sorts random array of size N with bubble sort (deliberately slow), GET `/matrix?size=<N>` does naive matrix multiplication NxN. Designed so hitting /fibonacci?n=40 repeatedly creates obvious heatmap hot spots. Listens on port 3000. Start with `node --inspect src/index.js` [proj.sample.1].

### sample-app-package.md
**Output:** sample-app/package.json
Sample app package.json: name code-heat-sample, private, type module. Scripts: dev (node --inspect src/index.js), build (tsc). DevDeps: typescript, @types/node [proj.sample.pkg.1].

### readme.md
**Output:** README.md
Project README: what code-heat is, quick-start (3 commands), architecture ASCII diagram, CLI reference table, Docker usage, PowSync notes, development setup. Uses markdown with code blocks [proj.readme.1].
