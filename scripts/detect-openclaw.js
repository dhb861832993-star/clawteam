#!/usr/bin/env node

/**
 * OpenClaw Detection Script
 *
 * Automatically detects OpenClaw installation and generates .env file.
 * Run this script after cloning the repository.
 *
 * Usage:
 *   node scripts/detect-openclaw.js
 *   node scripts/detect-openclaw.js --force    # Overwrite existing .env
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE = path.join(__dirname, '..', '.env.example');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    const result = spawnSync(command, ['--version'], {
      encoding: 'utf-8',
      timeout: 5000,
      shell: true,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

function getCommandPath(command) {
  try {
    const result = execSync(`which ${command}`, { encoding: 'utf-8' }).trim();
    return result || null;
  } catch {
    return null;
  }
}

function getOpenClawInfo(command) {
  try {
    const result = spawnSync(command, ['--version'], {
      encoding: 'utf-8',
      timeout: 5000,
      shell: true,
    });
    if (result.status === 0) {
      return result.stdout.trim();
    }
  } catch {}
  return 'unknown';
}

function findOpenClawLogPath() {
  const candidates = [
    '/tmp/openclaw',
    path.join(os.homedir(), '.openclaw', 'logs'),
    '/var/log/openclaw',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return '/tmp/openclaw'; // Default
}

function findOpenClawWorkspace() {
  const candidates = [
    path.join(os.homedir(), '.openclaw', 'workspace'),
    path.join(os.homedir(), 'openclaw', 'workspace'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(os.homedir(), '.openclaw', 'workspace'); // Default
}

function checkGatewayRunning() {
  try {
    const result = spawnSync('curl', ['-s', 'http://127.0.0.1:18789/health'], {
      encoding: 'utf-8',
      timeout: 3000,
    });
    if (result.status === 0) {
      try {
        const data = JSON.parse(result.stdout);
        return data.ok === true;
      } catch {}
    }
  } catch {}
  return false;
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force') || args.includes('-f'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function showHelp() {
  console.log(`
OpenClaw Detection Script

Usage:
  node scripts/detect-openclaw.js [options]

Options:
  -f, --force    Overwrite existing .env file
  -h, --help     Show this help message

Description:
  This script detects your OpenClaw installation and generates
  a .env configuration file for the Dashboard.

  It will check:
  - OpenClaw binary location
  - Log file directory
  - Workspace directory
  - Gateway status

Examples:
  node scripts/detect-openclaw.js           # Create .env if not exists
  node scripts/detect-openclaw.js --force   # Overwrite existing .env
`);
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  log('\n🔍 Detecting OpenClaw installation...\n', 'blue');

  // Check if .env already exists
  if (fs.existsSync(ENV_FILE) && !args.force) {
    log('⚠️  .env file already exists. Use --force to overwrite.', 'yellow');
    log(`   Current file: ${ENV_FILE}`, 'dim');
    process.exit(0);
  }

  // Detect OpenClaw command
  let openclawCommand = 'openclaw';
  const openclawPath = getCommandPath('openclaw');

  if (openclawPath) {
    log(`✅ OpenClaw found at: ${openclawPath}`, 'green');
    const version = getOpenClawInfo('openclaw');
    log(`   Version: ${version}`, 'dim');
  } else {
    log('⚠️  OpenClaw not found in PATH', 'yellow');
    log('   Trying common locations...', 'dim');

    // Try common locations
    const commonPaths = [
      '/usr/local/bin/openclaw',
      '/usr/bin/openclaw',
      path.join(os.homedir(), '.local', 'bin', 'openclaw'),
      path.join(os.homedir(), 'openclaw', 'dist', 'cli.js'),
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        openclawCommand = p;
        log(`✅ Found OpenClaw at: ${p}`, 'green');
        break;
      }
    }

    if (openclawCommand === 'openclaw') {
      log('❌ Could not find OpenClaw. Please install it first.', 'red');
      log('   See: https://github.com/anthropics/openclaw', 'dim');
    }
  }

  // Detect log path
  log('\n📁 Checking log directory...', 'blue');
  const logPath = findOpenClawLogPath();
  if (fs.existsSync(logPath)) {
    log(`✅ Log directory: ${logPath}`, 'green');
  } else {
    log(`⚠️  Log directory not found, using default: ${logPath}`, 'yellow');
  }

  // Detect workspace
  log('\n📂 Checking workspace directory...', 'blue');
  const workspacePath = findOpenClawWorkspace();
  if (fs.existsSync(workspacePath)) {
    log(`✅ Workspace directory: ${workspacePath}`, 'green');
  } else {
    log(`⚠️  Workspace not found, using default: ${workspacePath}`, 'yellow');
  }

  // Check Gateway
  log('\n🌐 Checking Gateway...', 'blue');
  const gatewayRunning = checkGatewayRunning();
  if (gatewayRunning) {
    log('✅ Gateway is running at ws://127.0.0.1:18789', 'green');
  } else {
    log('⚠️  Gateway not running. Start with: openclaw gateway start', 'yellow');
  }

  // Read .env.example as template
  let envContent = '';
  if (fs.existsSync(ENV_EXAMPLE)) {
    envContent = fs.readFileSync(ENV_EXAMPLE, 'utf-8');
  } else {
    // Fallback template
    envContent = `# OpenClaw Dashboard Configuration
# Generated by detect-openclaw.js

# Server Configuration
OPENCLAW_DASHBOARD_PORT=3001
OPENCLAW_DASHBOARD_HOST=localhost

# OpenClaw CLI Configuration
OPENCLAW_COMMAND=openclaw
OPENCLAW_TIMEOUT=60000
OPENCLAW_LOG_PATH=/tmp/openclaw
OPENCLAW_WORKSPACE_BASE=~/.openclaw/workspace

# Gateway Configuration
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
`;
  }

  // Update values
  envContent = envContent
    .replace(/^OPENCLAW_COMMAND=.*$/m, `OPENCLAW_COMMAND=${openclawCommand}`)
    .replace(/^OPENCLAW_LOG_PATH=.*$/m, `OPENCLAW_LOG_PATH=${logPath}`)
    .replace(/^OPENCLAW_WORKSPACE_BASE=.*$/m, `OPENCLAW_WORKSPACE_BASE=${workspacePath}`);

  // Write .env file
  fs.writeFileSync(ENV_FILE, envContent);
  log(`\n✅ Configuration written to: ${ENV_FILE}`, 'green');

  // Summary
  log('\n📋 Configuration Summary:', 'blue');
  log(`   OPENCLAW_COMMAND=${openclawCommand}`);
  log(`   OPENCLAW_LOG_PATH=${logPath}`);
  log(`   OPENCLAW_WORKSPACE_BASE=${workspacePath}`);
  log(`   OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789`);

  log('\n🚀 Next steps:', 'blue');
  log('   1. Install dependencies: npm install');
  log('   2. Start the dashboard:  npm run dev:all');
  if (!gatewayRunning) {
    log('   3. Start OpenClaw Gateway: openclaw gateway start', 'yellow');
  }

  log('');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});