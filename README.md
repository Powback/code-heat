# code-heat
<!-- [proj.readme.1.1] -->

<!-- [proj.readme.1.2] -->
**Real-time Node.js profiler with live heatmap visualization**

<!-- [proj.readme.1.3] -->
code-heat connects to any Node.js process via Chrome DevTools Protocol, captures CPU profiling data, and displays a real-time heatmap overlaid directly on your source code in a Monaco-based dashboard. See which lines are hot, track performance changes live, and identify bottlenecks instantly.

---

## Quick Start

<!-- [proj.readme.1.4] -->
```bash
<!-- [proj.readme.1.5] -->
# 1. Install dependencies
pnpm install

# 2. Start profiling a Node.js app (run with --inspect flag)
pnpm code-heat start localhost:9229

# 3. Open the dashboard
pnpm code-heat dashboard
```

Expected output:
- **Step 2**: `✓ Profiler attached to localhost:9229 | Dashboard: http://localhost:4321`
- **Step 3**: Browser opens to `http://localhost:4321` showing live heatmap

---

## Architecture

<!-- [proj.readme.1.6] -->
```
<!-- [proj.readme.1.7] -->
┌─────────────┐  CDP/WS   ┌──────────────┐  Redis    ┌───────────┐
│ Node.js App │ ────────> │   Profiler   │ ────────> │   Redis   │
│ (--inspect) │           │   Service    │           │   Store   │
└─────────────┘           └──────────────┘           └───────────┘
                                 │                          ▲
                                 │ WebSocket                │
                                 ▼                          │
                          ┌─────────────┐                   │
                          │  Dashboard  │ ──────────────────┘
                          │  (Astro UI) │      HTTP API
                          └─────────────┘
```

**Data flow:**
1. Node.js app runs with `--inspect` flag, exposing Chrome DevTools Protocol on port 9229
2. Profiler service connects via CDP, captures CPU profile samples
3. Heat data stored in Redis, broadcast via WebSocket to dashboard
4. Dashboard UI retrieves file content, applies heatmap decorations in Monaco Editor

---

## CLI Reference
<!-- [proj.readme.1.8] -->

<!-- [proj.readme.1.9] -->
| Command | Description | Example |
|---------|-------------|---------|
<!-- [proj.readme.1.10] -->
| `start <target>` | Attach profiler to running Node.js process | `code-heat start localhost:9229` |
| `start --spawn <cmd>` | Spawn a new Node.js process with --inspect and auto-attach | `code-heat start --spawn "node app.js"` |
| `dashboard` | Open dashboard in default browser | `code-heat dashboard` |
| `record [--duration <time>] <target>` | Record profiling session for specified duration | `code-heat record --duration 5m localhost:9229` |
| `sessions` | List all stored profiling sessions | `code-heat sessions` |
| `analyze <file>` | Analyze .cpuprofile JSON file and display heat summary | `code-heat analyze profile.cpuprofile` |

---

## Docker Usage

<!-- [proj.readme.1.11] -->
Run the full stack with Docker Compose:

```bash
docker compose up -d
```

<!-- [proj.readme.1.12] -->
**Environment variables:**
- `PROFILER_WS_URL` — WebSocket endpoint (default: `ws://localhost:7700`)
- `PROFILER_HTTP_URL` — HTTP API endpoint (default: `http://localhost:7701`)
- `TARGET_HOST` — Node.js inspector host (default: `host.docker.internal`)
- `TARGET_PORT` — Node.js inspector port (default: `9229`)

<!-- [proj.readme.1.13] -->
**Port mappings:**
- `4321` — Dashboard UI (Astro)
- `7700` — Profiler WebSocket server
- `7701` — Profiler HTTP API
- `6379` — Redis (internal only)

Access dashboard at `http://localhost:4321` or `http://code-heat.pow` (if Traefik configured).

---

## Development Setup

<!-- [proj.readme.1.14] -->
### Prerequisites
<!-- [proj.readme.1.15] -->
- Node.js 18+ (22 recommended)
- pnpm 8+

### Installation
```bash
<!-- [proj.readme.1.15] -->
pnpm install
```

### Running in Development
```bash
<!-- [proj.readme.1.16] -->
# Run all packages in parallel watch mode
pnpm run dev

<!-- [proj.readme.1.17] -->
# Run sample app (for testing profiler)
pnpm run sample
```

### Building for Production
```bash
<!-- [proj.readme.1.17] -->
pnpm run build
```

---

## Code Organization

<!-- [proj.readme.1.18] -->
```
code-heat/
├── packages/
│   ├── cli/          — Command-line interface (Commander.js)
│   ├── profiler/     — CDP profiler service + WebSocket server
│   └── dashboard/    — Astro + React heatmap UI (Monaco Editor)
└── sample-app/       — Demo Node.js HTTP server for testing
```

<!-- [proj.readme.1.19] -->
**Package purposes:**
- **cli**: Entry point for `code-heat` command, orchestrates profiler and dashboard
- **profiler**: Connects to Node.js via Chrome DevTools Protocol, aggregates heat data, broadcasts updates
- **dashboard**: Real-time UI with file tree, Monaco editor, heatmap overlays, and session timeline
- **sample-app**: Intentionally inefficient HTTP server (fibonacci, bubble sort, matrix multiply) for profiling demos

---

## PowSync Integration

<!-- [proj.readme.1.20] -->
code-heat is designed to integrate seamlessly with the PowStation infrastructure:

<!-- [proj.readme.1.21] -->
- **Traefik routing**: Dashboard auto-registers via Docker labels at `code-heat.pow`
- **Pi-hole DNS**: `dns-sync` service creates local DNS entry for `*.pow` domains
- **Shared network**: Connects to `traefik` external network for reverse proxy access

To enable PowSync integration, ensure `docker-compose.yml` includes Traefik labels and the `traefik` external network is defined.

---

## License

MIT
