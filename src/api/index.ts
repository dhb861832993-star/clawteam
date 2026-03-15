import type { Agent, AgentFile, Message, Log } from '../types';

// API Base URL (proxied through Vite dev server)
const API_BASE = '/api';

// Helper function for API calls
async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

async function apiPut<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

// Agent types from OpenClaw
interface OpenClawAgent {
  id: string;
  name?: string;
  identityName?: string;
  identityEmoji?: string;
  workspace: string;
  agentDir?: string;
  model: string;
  bindings: number;
  isDefault: boolean;
}

interface SessionData {
  agentId: string;
  key: string;
  kind: string;
  sessionId: string;
  updatedAt: number;
  age: number;
  totalTokens: number | null;
  model: string;
}

// Status response from Gateway
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
    recent: SessionData[];
    byAgent: Array<{
      agentId: string;
      count: number;
      recent: SessionData[];
    }>;
  };
}

// Get all agents from OpenClaw
export async function fetchAgents(): Promise<Agent[]> {
  try {
    const agents = await apiGet<OpenClawAgent[]>('/agents');

    return agents.map((agent, index) => {
      // Determine status based on session activity
      const status: Agent['status'] = agent.isDefault ? 'online' : 'waiting';

      return {
        id: agent.id,
        name: agent.identityName || agent.name || agent.id.toUpperCase(),
        role: agent.isDefault ? 'leader' : 'worker',
        avatar: agent.identityEmoji || getDefaultAvatar(index),
        status,
        workspace: agent.workspace,
        capabilities: getCapabilitiesForAgent(agent.id),
        load: Math.floor(Math.random() * 60) + 20, // Placeholder
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    throw error;
  }
}

// Get default avatar based on index
function getDefaultAvatar(index: number): string {
  const avatars = ['🐻', '🦉', '🐱', '🐜', '🦜', '🎨', '📊', '👔'];
  return avatars[index % avatars.length];
}

// Get capabilities based on agent type
function getCapabilitiesForAgent(agentId: string): string[] {
  const capabilityMap: Record<string, string[]> = {
    main: ['协调', '决策', '任务分配', '通用助手'],
    leader: ['协调', '决策', '团队管理', '任务分配'],
    analyst: ['数据分析', '市场调研', '报告生成', '竞品分析'],
    designer: ['UI设计', '视觉设计', '原型制作', '创意构思'],
    writer: ['内容创作', '文案撰写', 'SEO优化', '编辑'],
    operator: ['运营', '发布', '监控', '数据分析'],
  };
  return capabilityMap[agentId] || ['通用任务'];
}

// Get agent sessions
export async function fetchAgentSessions(agentId: string): Promise<SessionData[]> {
  return apiGet<SessionData[]>(`/agents/${agentId}/sessions`);
}

// Get gateway health
export async function fetchGatewayHealth() {
  return apiGet('/gateway/health');
}

// Get gateway status
export async function fetchGatewayStatus(): Promise<StatusResponse> {
  return apiGet<StatusResponse>('/gateway/status');
}

// Send message to agent
export async function sendMessageToAgent(
  agentId: string,
  message: string,
  sessionKey?: string
): Promise<Message> {
  const result = await apiPost<{ ok: boolean; response?: string }>(
    `/agents/${agentId}/send`,
    { message, sessionKey }
  );

  return {
    id: Date.now().toString(),
    agentId,
    agentName: agentId,
    content: result.response || 'Message sent',
    type: 'text',
    timestamp: new Date(),
  };
}

// Get Agent file content
export async function fetchAgentFile(agentId: string, fileName: string): Promise<AgentFile | null> {
  try {
    const file = await apiGet<AgentFile>(`/agents/${agentId}/files/${fileName}`);
    return file;
  } catch (error) {
    console.error('Failed to fetch agent file:', error);
    return null;
  }
}

// Save Agent file
export async function saveAgentFile(
  agentId: string,
  fileName: string,
  content: string
): Promise<boolean> {
  try {
    await apiPut(`/agents/${agentId}/files/${fileName}`, { content });
    return true;
  } catch (error) {
    console.error('Failed to save agent file:', error);
    return false;
  }
}

// Get logs
export async function fetchLogs(agentId?: string): Promise<Log[]> {
  try {
    const data = await apiGet<{ logs: string[] }>('/logs');
    return data.logs.map((line, index) => ({
      id: index.toString(),
      level: line.includes('error') ? 'error' : line.includes('warn') ? 'warn' : 'info',
      source: 'system' as const,
      sourceId: agentId,
      message: line,
      timestamp: new Date(),
    }));
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return [];
  }
}

// Legacy exports for backward compatibility
export const openClawApi = {
  listSessions: fetchAgentSessions,
  sendToSession: sendMessageToAgent,
};