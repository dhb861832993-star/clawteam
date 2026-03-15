/**
 * OpenClaw Client
 *
 * A unified client for interacting with OpenClaw CLI and Gateway.
 * Handles command execution, error handling, and connection management.
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import type { Config } from '../config';

const execAsync = promisify(exec);

// Types for OpenClaw responses
export interface AgentInfo {
  id: string;
  name?: string;
  identityName?: string;
  identityEmoji?: string;
  workspace: string;
  agentDir?: string;
  model: string;
  bindings: number;
  isDefault: boolean;
  heartbeat?: {
    enabled: boolean;
    every: string;
    everyMs: number | null;
  };
  sessions?: {
    path: string;
    count: number;
  };
}

export interface SessionInfo {
  agentId: string;
  key: string;
  kind: string;
  sessionId: string;
  updatedAt: number;
  age: number;
  systemSent: boolean;
  abortedLastRun: boolean;
  totalTokens: number | null;
  model: string;
  contextTokens: number;
}

export interface HealthResponse {
  ok: boolean;
  agents: AgentInfo[];
  sessions: {
    count: number;
    recent: SessionInfo[];
    byAgent: Array<{
      agentId: string;
      count: number;
      recent: SessionInfo[];
    }>;
  };
}

export interface StatusResponse {
  runtimeVersion: string;
  heartbeat: {
    defaultAgentId: string;
    agents: Array<{
      agentId: string;
      enabled: boolean;
      every: string;
    }>;
  };
  sessions: {
    count: number;
    recent: SessionInfo[];
    byAgent: Array<{
      agentId: string;
      count: number;
      recent: SessionInfo[];
    }>;
  };
}

export interface SendMessageResult {
  ok: boolean;
  response?: string;
  error?: string;
}

export interface FileInfo {
  name: string;
  path: string;
  content: string;
  lastModified: Date;
}

/**
 * Error class for OpenClaw-specific errors
 */
export class OpenClawError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'OpenClawError';
  }
}

/**
 * OpenClaw Client Class
 *
 * Provides a clean interface for all OpenClaw operations.
 */
export class OpenClawClient {
  private config: Config;
  private cachedAgents: AgentInfo[] | null = null;
  private cacheTime: number = 0;
  private readonly cacheTTL = 5000; // 5 seconds cache

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Execute an OpenClaw CLI command
   */
  private async execCommand(args: string, addToken = false): Promise<string> {
    const { command, timeout } = this.config.openclaw;
    const { token } = this.config.gateway;

    let fullCommand = `${command} ${args}`;
    if (addToken && token) {
      fullCommand += ` --token "${token}"`;
    }

    try {
      const { stdout, stderr } = await execAsync(fullCommand, {
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      // Log stderr but don't throw (OpenClaw uses stderr for progress)
      if (stderr && !stderr.includes('🦞')) {
        console.error('[OpenClaw] stderr:', stderr);
      }

      return stdout;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string; killed?: boolean };
      if (err.killed) {
        throw new OpenClawError(
          `Command timed out after ${timeout}ms`,
          'TIMEOUT',
          { command: fullCommand }
        );
      }
      throw new OpenClawError(
        `Command failed: ${err.message}`,
        'COMMAND_FAILED',
        { command: fullCommand, error }
      );
    }
  }

  /**
   * Get list of all agents
   */
  async listAgents(forceRefresh = false): Promise<AgentInfo[]> {
    // Use cache if valid
    if (!forceRefresh && this.cachedAgents && Date.now() - this.cacheTime < this.cacheTTL) {
      return this.cachedAgents;
    }

    try {
      const stdout = await this.execCommand('agents list --json');
      const agents = JSON.parse(stdout);
      this.cachedAgents = agents;
      this.cacheTime = Date.now();
      return agents;
    } catch (error) {
      console.error('[OpenClaw] Failed to list agents:', error);
      throw error;
    }
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(agentId: string): Promise<AgentInfo | null> {
    const agents = await this.listAgents();
    return agents.find(a => a.id === agentId) || null;
  }

  /**
   * Get sessions for a specific agent
   */
  async getAgentSessions(agentId: string): Promise<SessionInfo[]> {
    try {
      const stdout = await this.execCommand(`sessions --agent ${agentId} --json`);
      const data = JSON.parse(stdout);
      return data.sessions || [];
    } catch (error) {
      console.error(`[OpenClaw] Failed to get sessions for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get gateway health
   */
  async getHealth(): Promise<HealthResponse> {
    try {
      const stdout = await this.execCommand('gateway call health --json', true);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('[OpenClaw] Failed to get health:', error);
      throw error;
    }
  }

  /**
   * Get gateway status
   */
  async getStatus(): Promise<StatusResponse> {
    try {
      const stdout = await this.execCommand('gateway call status --json', true);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('[OpenClaw] Failed to get status:', error);
      throw error;
    }
  }

  /**
   * Send a message to an agent using spawn for safe parameter passing
   */
  async sendMessage(
    agentId: string,
    message: string,
    sessionKey?: string
  ): Promise<SendMessageResult> {
    const { command } = this.config.openclaw;

    console.log('[OpenClaw] Sending message to agent:', agentId);
    console.log('[OpenClaw] Message length:', message.length);

    return new Promise((resolve, reject) => {
      // Build args for 'openclaw agent' command
      const args = [
        'agent',
        '--agent', agentId,
        '--message', message,
        '--json'
      ];

      // Add session if provided
      if (sessionKey) {
        args.push('--session-id', sessionKey);
      }

      console.log('[OpenClaw] Command:', command, args.join(' '));

      const child = spawn(command, args);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        // Log stderr in real-time for debugging
        if (!text.includes('🦞')) {
          console.error('[OpenClaw stderr]', text.trim());
        }
      });

      child.on('error', (error) => {
        console.error('[OpenClaw] Process error:', error);
        reject(new OpenClawError(
          `Failed to spawn process: ${error.message}`,
          'SPAWN_ERROR',
          { agentId, error }
        ));
      });

      child.on('close', (code) => {
        console.log('[OpenClaw] Process exited with code:', code);
        console.log('[OpenClaw] stdout length:', stdout.length);

        if (code !== 0) {
          console.error('[OpenClaw] Full stderr:', stderr);
          reject(new OpenClawError(
            `Command failed with code ${code}: ${stderr}`,
            'COMMAND_FAILED',
            { agentId, code, stderr, stdout }
          ));
          return;
        }

        try {
          const data = JSON.parse(stdout);
          console.log('[OpenClaw] Result status:', data.status);

          // Extract the response text from the agent reply
          const responseText = data.result?.payloads?.[0]?.text || '';

          resolve({
            ok: data.status === 'ok',
            response: responseText,
            error: data.status !== 'ok' ? data.summary : undefined,
          });
        } catch (parseError) {
          console.error('[OpenClaw] JSON parse error:', parseError);
          console.error('[OpenClaw] Raw stdout:', stdout.substring(0, 500));
          reject(new OpenClawError(
            `Failed to parse response: ${stdout.substring(0, 100)}`,
            'PARSE_ERROR',
            { agentId, stdout: stdout.substring(0, 500) }
          ));
        }
      });
    });
  }

  /**
   * Read a file from an agent's workspace
   */
  async readFile(agentId: string, fileName: string): Promise<FileInfo> {
    const { workspaceBase } = this.config.openclaw;

    // Get agent to find workspace
    const agent = await this.getAgent(agentId);
    if (!agent) {
      throw new OpenClawError(`Agent not found: ${agentId}`, 'AGENT_NOT_FOUND');
    }

    // Resolve workspace path
    const workspacePath = agent.workspace || `${workspaceBase}/${agentId}`;
    const filePath = `${workspacePath}/${fileName}`;

    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);

      return {
        name: fileName,
        path: filePath,
        content,
        lastModified: stats.mtime,
      };
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'ENOENT') {
        throw new OpenClawError(
          `File not found: ${fileName}`,
          'FILE_NOT_FOUND',
          { path: filePath }
        );
      }
      throw new OpenClawError(
        `Failed to read file: ${fileName}`,
        'READ_ERROR',
        { path: filePath, error }
      );
    }
  }

  /**
   * Write a file to an agent's workspace
   */
  async writeFile(agentId: string, fileName: string, content: string): Promise<{ path: string }> {
    const { workspaceBase } = this.config.openclaw;

    // Get agent to find workspace
    const agent = await this.getAgent(agentId);
    if (!agent) {
      throw new OpenClawError(`Agent not found: ${agentId}`, 'AGENT_NOT_FOUND');
    }

    // Resolve workspace path
    const workspacePath = agent.workspace || `${workspaceBase}/${agentId}`;
    const filePath = `${workspacePath}/${fileName}`;

    try {
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, content, 'utf-8');

      return { path: filePath };
    } catch (error) {
      throw new OpenClawError(
        `Failed to write file: ${fileName}`,
        'WRITE_ERROR',
        { path: filePath, error }
      );
    }
  }

  /**
   * Clear the agent cache
   */
  clearCache(): void {
    this.cachedAgents = null;
    this.cacheTime = 0;
  }
}

// Singleton instance
let clientInstance: OpenClawClient | null = null;

/**
 * Get or create the OpenClaw client instance
 */
export function getOpenClawClient(config: Config): OpenClawClient {
  if (!clientInstance) {
    clientInstance = new OpenClawClient(config);
  }
  return clientInstance;
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetOpenClawClient(): void {
  clientInstance = null;
}