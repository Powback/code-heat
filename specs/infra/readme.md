**Type:** Markdown Documentation
**Output:** README.md

# README Documentation

## Project Title and Description
[proj.readme.1.1] Title: "code-heat" (main heading)
[proj.readme.1.2] Subtitle/tagline: Brief description of what code-heat does (profiling/performance visualization)
[proj.readme.1.3] One-paragraph overview explaining purpose and use case

## Quick Start Section
[proj.readme.1.4] Three command quick-start sequence:
  - Installation or setup command
  - Start command (code-heat start)
  - Dashboard command (code-heat dashboard)
[proj.readme.1.5] Each command should show what it does and expected output

## Architecture Section
[proj.readme.1.6] ASCII diagram showing: Node.js app → CDP → Profiler service → Redis → Dashboard UI
[proj.readme.1.7] Diagram should illustrate data flow: profiling data collection, storage, retrieval, visualization

## CLI Reference Table
[proj.readme.1.8] Table format with columns: Command, Description, Example
[proj.readme.1.9] Include all commands: start, dashboard, record, sessions, analyze
[proj.readme.1.10] Each command row should explain arguments and common options

## Docker Usage Section
[proj.readme.1.11] Instructions for running with Docker Compose
[proj.readme.1.12] Include environment variable configuration (PROFILER_WS_URL, PROFILER_HTTP_URL)
[proj.readme.1.13] Port mappings reference (4321 dashboard, 7700 profiler WS, 7701 profiler HTTP)

## Development Setup Section
[proj.readme.1.14] Prerequisites (Node.js version, pnpm)
[proj.readme.1.15] Installation: pnpm install
[proj.readme.1.16] Running dev mode: pnpm run dev
[proj.readme.1.17] Building: pnpm run build

## Code Organization Section
[proj.readme.1.18] Brief overview of directory structure: packages/cli, packages/profiler, packages/dashboard, sample-app
[proj.readme.1.19] One-sentence description of each package's purpose

## PowSync Integration Notes
[proj.readme.1.20] Optional section mentioning PowSync compatibility/integration if relevant
[proj.readme.1.21] Describe how data syncs or how to integrate with PowSync infrastructure