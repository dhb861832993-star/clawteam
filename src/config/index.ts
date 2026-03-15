/**
 * OpenClaw Dashboard Configuration
 *
 * All settings are configurable via environment variables.
 * Copy .env.example to .env and customize for your setup.
 */

// Load .env file if present (for Node.js environment)
if (typeof process !== 'undefined' && process.env) {
  try {
    // Dynamic import for dotenv if available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config();
  } catch {
    // dotenv not installed, using system env vars only
  }
}

export interface Config {
  // Server configuration
  server: {
    port: number;
    host: string;
  };

  // OpenClaw CLI configuration
  openclaw: {
    command: string;          // Path to openclaw binary or command name
    timeout: number;          // Default timeout for CLI commands (ms)
    logPath: string;          // Path to OpenClaw log files
    workspaceBase: string;    // Base path for agent workspaces
  };

  // Gateway WebSocket configuration
  gateway: {
    url: string;              // WebSocket URL for Gateway
    token: string;            // Gateway auth token
    reconnectInterval: number;
    requestTimeout: number;
  };

  // Frontend configuration (exposed to client)
  client: {
    apiBase: string;          // API base URL
    gatewayUrl: string;       // Gateway WebSocket URL for browser
  };
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]!;
  }
  return fallback;
}

/**
 * Get numeric environment variable with fallback
 */
function getEnvNumber(key: string, fallback: number): number {
  const value = getEnv(key, '');
  if (value) {
    const num = parseInt(value, 10);
    if (!isNaN(num)) return num;
  }
  return fallback;
}

/**
 * Build configuration from environment variables
 */
function buildConfig(): Config {
  return {
    server: {
      port: getEnvNumber('OPENCLAW_DASHBOARD_PORT', 3001),
      host: getEnv('OPENCLAW_DASHBOARD_HOST', 'localhost'),
    },

    openclaw: {
      command: getEnv('OPENCLAW_COMMAND', 'openclaw'),
      timeout: getEnvNumber('OPENCLAW_TIMEOUT', 60000),
      logPath: getEnv('OPENCLAW_LOG_PATH', '/tmp/openclaw'),
      workspaceBase: getEnv('OPENCLAW_WORKSPACE_BASE', `${process.env.HOME || '~'}/.openclaw/workspace`),
    },

    gateway: {
      url: getEnv('OPENCLAW_GATEWAY_URL', 'ws://127.0.0.1:18789'),
      token: getEnv('OPENCLAW_GATEWAY_TOKEN', ''),
      reconnectInterval: getEnvNumber('OPENCLAW_GATEWAY_RECONNECT_INTERVAL', 5000),
      requestTimeout: getEnvNumber('OPENCLAW_GATEWAY_REQUEST_TIMEOUT', 30000),
    },

    client: {
      apiBase: getEnv('OPENCLAW_API_BASE', '/api'),
      gatewayUrl: getEnv('OPENCLAW_GATEWAY_URL', 'ws://127.0.0.1:18789'),
    },
  };
}

// Singleton config instance
let config: Config | null = null;

/**
 * Get the application configuration
 */
export function getConfig(): Config {
  if (!config) {
    config = buildConfig();
  }
  return config;
}

/**
 * Validate configuration
 */
export function validateConfig(cfg: Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (cfg.server.port < 1 || cfg.server.port > 65535) {
    errors.push(`Invalid server port: ${cfg.server.port}`);
  }

  if (!cfg.gateway.url.startsWith('ws://') && !cfg.gateway.url.startsWith('wss://')) {
    errors.push(`Invalid gateway URL: ${cfg.gateway.url} (must start with ws:// or wss://)`);
  }

  if (cfg.openclaw.timeout < 1000) {
    errors.push(`OpenClaw timeout too short: ${cfg.openclaw.timeout}ms (minimum 1000ms)`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export default config instance
export default getConfig();