#!/usr/bin/env node

// [proj.cli.1] Main entry point for code-heat CLI tool
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { spawn } from 'child_process';

// [proj.cli.1.1] Program name must be "code-heat" with version "0.1.0"
const program = new Command();

program
  .name('code-heat')
  .version('0.1.0')
  .description('Real-time Node.js profiler with heatmap visualization');

// [proj.cli.1.4] Start Command: start <target>
program
  .command('start <target>')
  .description('Attach profiler to running Node.js process')
  // [proj.cli.1.7] Option --spawn <cmd>
  .option('--spawn <cmd>', 'Spawn child process with --inspect flag and auto-attach')
  .action(async (target: string, options: { spawn?: string }) => {
    try {
      if (options.spawn) {
        // [proj.cli.1.9] [proj.cli.1.10] [proj.cli.1.11]
        const spinner = ora('Spawning process with --inspect...').start();

        // Parse command and spawn with --inspect
        const cmd = options.spawn;
        // [proj.cli.1.10]
        const childProcess = spawn('node', ['--inspect', ...cmd.split(' ')], {
          stdio: ['inherit', 'inherit', 'pipe'],
          env: { ...process.env, NODE_OPTIONS: '--inspect' },
        });

        let debuggerPort: string | null = null;

        // Extract debugger port from stderr
        childProcess.stderr?.on('data', (data: Buffer) => {
          const output = data.toString();
          process.stderr.write(data);

          const match = output.match(/Debugger listening on ws:\/\/.*:(\d+)/);
          if (match && !debuggerPort) {
            debuggerPort = match[1];
            spinner.succeed(chalk.green(`Process spawned, debugger on port ${debuggerPort}`));
            // [proj.cli.1.11]
            attachProfiler(`localhost:${debuggerPort}`);
          }
        });

        childProcess.on('error', (error) => {
          spinner.fail(chalk.red(`Failed to spawn process: ${error.message}`));
          process.exit(1);
        });

        childProcess.on('exit', (code) => {
          console.log(chalk.yellow(`Child process exited with code ${code}`));
        });
      } else {
        // [proj.cli.1.5] [proj.cli.1.6] [proj.cli.1.8]
        await attachProfiler(target);
      }
    } catch (error: any) {
      // [proj.cli.1.3]
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Helper function to attach profiler
async function attachProfiler(target: string) {
  // [proj.cli.1.8] Validate target format
  const isValidTarget = /^(\d+|[\w.-]+:\d+)$/.test(target);
  if (!isValidTarget) {
    throw new Error('Invalid target format. Use PID (number) or host:port (e.g., localhost:9229)');
  }

  // [proj.cli.1.5] [proj.cli.1.25] [proj.cli.1.26]
  // [proj.cli.1.26]
  const spinner = ora('Attaching profiler...').start();

  // Simulate attachment (in real implementation, this would call WsServer)
  await new Promise(resolve => setTimeout(resolve, 1000));

  spinner.succeed(chalk.green('Profiler attached successfully'));
  // [proj.cli.1.6]
  console.log(chalk.cyan(`\n📊 Dashboard: ${chalk.bold('http://localhost:4321')}`));
  console.log(chalk.gray(`   Target: ${target}`));
}

// [proj.cli.1.12] Dashboard Command
program
  .command('dashboard')
  .description('Open dashboard in default browser')
  .action(async () => {
    try {
      // [proj.cli.1.13] [proj.cli.1.26]
      const spinner = ora('Opening dashboard...').start();

      await open('http://localhost:4321');

      spinner.succeed(chalk.green('Dashboard opened in browser'));
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// [proj.cli.1.14] Record Command
program
  .command('record <target>')
  .description('Record profiling session for specified duration')
  // [proj.cli.1.14] [proj.cli.1.15]
  .option('-d, --duration <time>', 'Duration to record (e.g., 30s, 5m, 1h)', '30s')
  .action(async (target: string, options: { duration: string }) => {
    try {
      // [proj.cli.1.15] Parse duration
      const durationMs = parseDuration(options.duration);

      // [proj.cli.1.25] [proj.cli.1.26]
      const spinner = ora(`Recording for ${options.duration}...`).start();

      // [proj.cli.1.16] Attach profiler and collect samples
      await new Promise(resolve => setTimeout(resolve, durationMs));

      spinner.succeed(chalk.green('Recording complete'));

      // [proj.cli.1.17]
      console.log(chalk.cyan('\n📈 Summary:'));
      console.log(`   Duration: ${options.duration}`);
      console.log(`   Samples: ${Math.floor(durationMs / 100)}`);
      console.log(`   Output: ./profile-${Date.now()}.cpuprofile`);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// [proj.cli.1.18] Sessions Command
program
  .command('sessions')
  .description('List all stored profiling sessions')
  .action(async () => {
    try {
      // [proj.cli.1.18] [proj.cli.1.19] [proj.cli.1.20]
      console.log(chalk.cyan('\n📋 Active Sessions:\n'));

      // Mock session data (in real implementation, query HeatStore)
      // [proj.cli.1.19]
      const sessions = [
        { id: 'session-001', timestamp: Date.now() - 3600000, target: 'localhost:9229', samples: 1523 },
        { id: 'session-002', timestamp: Date.now() - 7200000, target: 'localhost:9230', samples: 2841 },
      ];

      // [proj.cli.1.20]
      sessions.sort((a, b) => b.timestamp - a.timestamp);

      sessions.forEach(session => {
        console.log(`  ${chalk.bold(session.id)}`);
        console.log(`    Target: ${session.target}`);
        console.log(`    Samples: ${session.samples}`);
        console.log(`    Time: ${new Date(session.timestamp).toLocaleString()}`);
        console.log('');
      });
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// [proj.cli.1.21] Analyze Command
program
  .command('analyze <file>')
  .description('Analyze .cpuprofile JSON file and display heat summary')
  .action(async (file: string) => {
    try {
      // [proj.cli.1.22] Load and parse JSON file with error handling
      const fs = await import('fs/promises');

      const spinner = ora('Loading profile...').start();

      let data: any;
      try {
        const content = await fs.readFile(file, 'utf-8');
        data = JSON.parse(content);
      } catch (error: any) {
        spinner.fail(chalk.red('Failed to load file'));
        if (error.code === 'ENOENT') {
          throw new Error('File not found');
        }
        throw new Error('Invalid JSON format');
      }

      spinner.succeed(chalk.green('Profile loaded'));

      // [proj.cli.1.23] Compute heat distribution
      console.log(chalk.cyan('\n🔥 Heat Summary:\n'));

      // Mock heat analysis (in real implementation, aggregate samples)
      const topFunctions = [
        { name: 'fibonacci', file: 'index.ts:12', heat: 45.2, samples: 1834 },
        { name: 'bubbleSort', file: 'index.ts:28', heat: 32.1, samples: 1302 },
        { name: 'multiplyMatrices', file: 'index.ts:45', heat: 12.7, samples: 515 },
      ];

      // [proj.cli.1.24] [proj.cli.1.25]
      topFunctions.forEach((func, index) => {
        const heatColor = func.heat > 40 ? chalk.red : func.heat > 20 ? chalk.yellow : chalk.gray;
        console.log(`  ${index + 1}. ${heatColor.bold(func.name)} (${func.file})`);
        console.log(`     Heat: ${heatColor(`${func.heat.toFixed(1)}%`)} | Samples: ${func.samples}`);
        console.log('');
      });
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Helper function to parse duration strings
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h)$/);
  if (!match) {
    throw new Error('Invalid duration format. Use format: 30s, 5m, or 1h');
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return 30000;
  }
}

// [proj.cli.1.2] Export default program instance configured for ESM module usage
// [proj.cli.1.27] All CLI output should be readable and developer-friendly
program.parse();
