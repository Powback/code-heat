**Type:** JSON Package Configuration
**Output:** packages/cli/package.json

# CLI Package Configuration

## Package Metadata
[proj.cli.pkg.1.1] Package name must be "@code-heat/cli"
[proj.cli.pkg.1.2] Set private flag to true
[proj.cli.pkg.1.3] Module type must be "module" (ES6 modules)
[proj.cli.pkg.1.4] Include version "0.1.0"

## Bin Mapping
[proj.cli.pkg.1.5] Bin entry maps "code-heat" command to "./src/index.ts"
[proj.cli.pkg.1.6] This enables `code-heat` executable after npm install (or pnpm install)

## Scripts
[proj.cli.pkg.1.7] "start" script: `tsx src/index.ts` (run with tsx for development)
[proj.cli.pkg.1.8] "build" script: `tsc` (compile TypeScript to dist/)

## Runtime Dependencies
[proj.cli.pkg.1.9] commander: for CLI argument parsing and command structure
[proj.cli.pkg.1.10] chalk: for colored terminal output
[proj.cli.pkg.1.11] ora: for loading spinners and progress indicators
[proj.cli.pkg.1.12] open: for opening URLs in system browser

## Development Dependencies
[proj.cli.pkg.1.13] typescript: for type checking and compilation
[proj.cli.pkg.1.14] tsx: for running TypeScript files directly with Node.js
[proj.cli.pkg.1.15] @types/node: for Node.js type definitions

## Workspace Dependencies
[proj.cli.pkg.1.16] Depend on @code-heat/profiler workspace package (for profiler client functionality)