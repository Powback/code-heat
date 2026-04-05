**Type:** TypeScript CLI Module
**Output:** packages/cli/src/index.ts

# Commander CLI Implementation

## Overview
Main entry point for code-heat CLI tool. Implements command-line interface using Commander.js with chalk colors and ora spinners for user feedback [proj.cli.1].

## Program Configuration
[proj.cli.1.1] Program name must be "code-heat" with version "0.1.0"
[proj.cli.1.2] Must export default program instance configured for ESM module usage
[proj.cli.1.3] Should handle errors gracefully with try-catch at command level and display chalk-colored error messages

## Start Command: `start <target>`
[proj.cli.1.4] Accepts positional target argument: process ID (numeric) OR host:port string format (e.g., "localhost:9229")
[proj.cli.1.5] Spawns WsServer listening on port 7700 with ora spinner showing "Attaching profiler..."
[proj.cli.1.6] On successful connection, print dashboard URL to console using chalk.green()
[proj.cli.1.7] Option `--spawn <cmd>`: fork child process with `--inspect` flag, wait for debugger port output, auto-attach to spawned process
[proj.cli.1.8] Should validate target format before attempting connection; show chalk.red() error if invalid

## Start Spawn Variant: `start --spawn <cmd>`
[proj.cli.1.9] Parse command string and spawn child process with NODE_OPTIONS=--inspect prepended
[proj.cli.1.10] Extract debugger port from child stderr output (matches `Debugger listening on ws://...` pattern)
[proj.cli.1.11] Auto-attach WsServer to extracted port on success, inherit parent command's success output behavior

## Dashboard Command: `dashboard`
[proj.cli.1.12] Opens http://localhost:4321 in default system browser using `open` package
[proj.cli.1.13] Provide spinner feedback with "Opening dashboard..."

## Record Command: `record [--duration <time>] <target>`
[proj.cli.1.14] Accepts optional `--duration` flag in format "30s", "5m", "1h" (parsed to milliseconds)
[proj.cli.1.15] Defaults to 30-second duration if not specified
[proj.cli.1.16] Attaches profiler to target, collects samples for specified duration, auto-detaches when time expires
[proj.cli.1.17] Prints summary statistics: duration collected, sample count, output file path

## Sessions Command: `sessions`
[proj.cli.1.18] Queries HeatStore instance to list all stored session records
[proj.cli.1.19] Formats output as table (or list) showing: session ID, timestamp, target host:port, sample count
[proj.cli.1.20] Sort by timestamp descending (most recent first)

## Analyze Command: `analyze <file>`
[proj.cli.1.21] Accepts path to V8 .cpuprofile JSON file (user-provided or existing)
[proj.cli.1.22] Load and parse JSON file with error handling (file not found, invalid JSON)
[proj.cli.1.23] Compute heat distribution: aggregate samples by function/file/line, calculate percentages
[proj.cli.1.24] Display heat summary to console with chalk colors (hot functions highlighted in red/yellow)

## Output Styling
[proj.cli.1.25] Use chalk for all colored output: chalk.green() for success, chalk.red() for errors, chalk.yellow() for warnings, chalk.cyan() for info
[proj.cli.1.26] Use ora spinners for async operations with meaningful messages
[proj.cli.1.27] All CLI output should be readable and developer-friendly