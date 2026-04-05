**Type:** JSON Package Configuration
**Output:** package.json

# Root Monorepo Package Configuration

## Package Metadata
[proj.root.pkg.1.1] Package name must be "code-heat"
[proj.root.pkg.1.2] Set private flag to true (monorepo root is not published)
[proj.root.pkg.1.3] Module type must be "module" (ES6 modules)
[proj.root.pkg.1.4] Package manager: "pnpm" with exact version constraint

## Workspace Scripts
[proj.root.pkg.1.5] "dev" script: `pnpm run --parallel dev --filter './packages/*'` (run all packages in parallel dev mode)
[proj.root.pkg.1.6] "build" script: `pnpm run --recursive build` (build all workspace packages recursively)
[proj.root.pkg.1.7] "sample" script: `pnpm --filter sample-app run dev` (run sample app in development)

## Workspace Configuration
[proj.root.pkg.1.8] No dependencies or devDependencies at root level (dependencies managed per package)
[proj.root.pkg.1.9] workspaces configuration may be in pnpm-workspace.yaml (separate file)