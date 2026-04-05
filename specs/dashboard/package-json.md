**Type:** JSON package manifest  
**Output:** packages/dashboard/package.json

## Package Configuration

### Metadata [pkg.meta.1]
- name: "@code-heat/dashboard"
- version: "0.1.0" (initial)
- description: "Real-time profiling heatmap dashboard with Monaco Editor"
- private: true
- type: "module" (ESM)
- license: "MIT"

### Entry Points [pkg.exports.1]
- No public exports (private package)
- main/module fields optional for private pkg

### Scripts [pkg.scripts.1]
- dev: "astro dev"
- build: "astro build"
- start: "node dist/server/entry.mjs"
- preview: "astro preview"
- type-check: "tsc --noEmit"

### Dependencies [pkg.deps.1]
- astro: ^4.0.0
- @astrojs/node: ^6.0.0
- @astrojs/react: ^3.0.0
- @monaco-editor/react: ^4.6.0
- monaco-editor: ^0.50.0
- react: ^18.2.0
- react-dom: ^18.2.0

### Workspace Dependencies [pkg.workspace.1]
- @code-heat/profiler: "workspace:*" (monorepo sibling)

### DevDependencies [pkg.devdeps.1]
- typescript: ^5.3.0
- @types/react: ^18.2.0
- @types/node: ^20.0.0
- astro: includes types; no separate @types needed

### Package Manager [pkg.manager.1]
- Specify packageManager: "pnpm@8.0.0" or higher

### Engines [pkg.engines.1]
- node: ">=18.0.0"