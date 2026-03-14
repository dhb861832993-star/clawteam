/**
 * OpenClaw Gateway API Client
 *
 * Connects to the OpenClaw Gateway via WebSocket.
 * Gateway URL is fetched from the server configuration.
 */

// Types
export interface AgentInfo {
  agentId: string;
  name?: string;
  identityName?: string;
  identityEmoji?: string;
  workspace: string;
  isDefault: boolean;
  model: string;
  bindings: number;
  heartbeat: {
    enabled: boolean;
    every: string;
    everyMs: number | null;
  };
  sessions: {
    path: string;
    count: number;
    recent: Array<{
      key: string;
      updatedAt: number;
      age: number;
      sessionId?: string;
    }>;
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

// File operations
export interface FileContent {
  name: string;
  path: string;
  content: string;
  lastModified: Date;
}

// Configuration from server
interface ServerConfig {
  gateway: string;
  openclaw: string;
}

let serverConfig: ServerConfig | null = null;

/**
 * Fetch configuration from server
 */
async function getServerConfig(): Promise<ServerConfig> {
  if (serverConfig) return serverConfig;

  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      const data = await response.json();
      serverConfig = data.config;
      return serverConfig!;
    }
  } catch (error) {
    console.warn('[Gateway] Failed to fetch server config, using defaults');
  }

  // Fallback to defaults
  return {
    gateway: 'ws://127.0.0.1:18789',
    openclaw: 'openclaw',
  };
}

// Gateway RPC Client
class GatewayClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();
  private connectPromise: Promise<void> | null = null;
  private gatewayUrl: string | null = null;

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    // Get gateway URL from server config
    if (!this.gatewayUrl) {
      const config = await getServerConfig();
      this.gatewayUrl = config.gateway;
    }

    this.connectPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.gatewayUrl!);

        this.ws.onopen = () => {
          console.log('[Gateway] Connected to', this.gatewayUrl);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            this.handleResponse(response);
          } catch (e) {
            console.error('[Gateway] Failed to parse response:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[Gateway] Error:', error);
          reject(new Error('WebSocket error'));
        };

        this.ws.onclose = () => {
          console.log('[Gateway] Disconnected');
          this.ws = null;
          this.connectPromise = null;
        };
      } catch (error) {
        reject(error);
      }
    });

    return this.connectPromise;
  }

  private handleResponse(response: { id?: string; result?: unknown; error?: string }) {
    if (!response.id) return;

    const pending = this.pendingRequests.get(response.id);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);

    if (response.error) {
      pending.reject(new Error(response.error));
    } else {
      pending.resolve(response.result);
    }
  }

  async call<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    await this.connect();

    return new Promise((resolve, reject) => {
      const id = (++this.requestId).toString();

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout for ${method}`));
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });

      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.ws?.send(JSON.stringify(request));
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectPromise = null;
  }
}

// Singleton client
let gatewayClient: GatewayClient | null = null;

function getClient(): GatewayClient {
  if (!gatewayClient) {
    gatewayClient = new GatewayClient();
  }
  return gatewayClient;
}

// API Functions

/**
 * Get gateway health status with agent information
 */
export async function fetchGatewayHealth(): Promise<HealthResponse> {
  return getClient().call<HealthResponse>('health');
}

/**
 * Get gateway status
 */
export async function fetchGatewayStatus(): Promise<StatusResponse> {
  return getClient().call<StatusResponse>('status');
}

/**
 * Send a message to an agent
 */
export async function sendAgentMessage(
  agentId: string,
  message: string,
  sessionKey?: string
): Promise<{ ok: boolean; response?: string }> {
  const params: Record<string, unknown> = {
    agentId,
    text: message,
  };

  if (sessionKey) {
    params.sessionKey = sessionKey;
  }

  // Use expect-final to wait for agent response
  return getClient().call('agent.send', params);
}

/**
 * Get list of all agents with their info
 */
export async function fetchAgentsList(): Promise<Array<{
  id: string;
  name?: string;
  identityName?: string;
  identityEmoji?: string;
  workspace: string;
  agentDir: string;
  model: string;
  bindings: number;
  isDefault: boolean;
}>> {
  // Use CLI to get agent list (more reliable)
  const response = await fetch('/api/agents');
  if (response.ok) {
    return response.json();
  }

  // Fallback to gateway health
  const health = await fetchGatewayHealth();
  return health.agents.map(agent => ({
    id: agent.agentId,
    identityName: agent.identityName,
    identityEmoji: agent.identityEmoji,
    workspace: agent.sessions.path.replace('/sessions/sessions.json', ''),
    model: 'unknown',
    bindings: agent.bindings,
    isDefault: agent.isDefault,
  }));
}

/**
 * Get sessions for a specific agent
 */
export async function fetchAgentSessions(agentId: string): Promise<SessionInfo[]> {
  const health = await fetchGatewayHealth();
  const agentData = health.sessions.byAgent.find(a => a.agentId === agentId);
  return agentData?.recent || [];
}

/**
 * Read a file from agent workspace
 */
export async function readAgentFile(agentId: string, fileName: string): Promise<FileContent | null> {
  try {
    const response = await fetch(`/api/agents/${agentId}/files/${fileName}`);
    if (response.ok) {
      return response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to read file:', error);
    return null;
  }
}

/**
 * Write a file to agent workspace
 */
export async function writeAgentFile(
  agentId: string,
  fileName: string,
  content: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/agents/${agentId}/files/${fileName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to write file:', error);
    return false;
  }
}