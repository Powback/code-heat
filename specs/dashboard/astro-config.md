**Type:** TypeScript config module  
**Output:** packages/dashboard/astro.config.ts

## Astro Configuration

### Integration Imports [astro.imports.1]
- Import defineConfig from astro
- Import node adapter from @astrojs/node
- Import react integration from @astrojs/react

### Output & Adapter [astro.output.1]
- Set output: "server" for SSR
- Use @astrojs/node adapter in standalone mode
- Configure host: "0.0.0.0", port: 4321 (or from PORT env var)

### React Integration [astro.react.1]
- Enable @astrojs/react with default settings
- Allow client:only islands

### Environment Variables [astro.env.1]
- Define env public vars: PROFILER_WS_URL, PROFILER_HTTP_URL
- Defaults in config (fallback to localhost):
  - PROFILER_WS_URL: "ws://localhost:7700"
  - PROFILER_HTTP_URL: "http://localhost:7701"

### Vite Aliases [astro.vite.1]
- Configure alias @profiler → ../profiler/src (absolute path)
- Allows imports: import {...} from "@profiler/types"

### TypeScript [astro.typescript.1]
- Set strict: true
- Enable lib: ["es2020", "dom", "dom.iterable"]

### Build & Dev [astro.build.1]
- Set outDir: "./dist"
- Enable sourcemaps in dev
- Configure vite.define for any build-time constants

### Export [astro.export.1]
- Export default config object