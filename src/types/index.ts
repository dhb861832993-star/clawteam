// Agent 状态类型
export type AgentStatus = 'online' | 'working' | 'waiting' | 'offline' | 'error';

// Agent 模型
export interface Agent {
  id: string;
  name: string;           // 显示名：队长、分析师...
  role: string;           // 角色：leader、analyst、designer...
  avatar: string;         // 动物 emoji：🦁🐻🐱...
  status: AgentStatus;
  workspace: string;      // 工作空间路径
  capabilities: string[]; // 能力列表
  load: number;           // 负载 0-100
  createdAt: Date;
  updatedAt: Date;
}

// 任务步骤
export interface TaskStep {
  id: string;
  name: string;           // 步骤名：市场调研、内容创作...
  status: 'pending' | 'running' | 'completed' | 'failed';
  assignedAgent?: string; // 负责的 Agent
  output?: string;        // 产出物路径
  startedAt?: Date;
  completedAt?: Date;
}

// 任务模型
export interface Task {
  id: string;
  title: string;          // 任务标题
  description: string;    // 任务描述（自然语言）
  status: 'pending' | 'running' | 'completed' | 'failed' | 'blocked';
  progress: number;       // 0-100
  assignedAgents: string[]; // 分配的 Agent ID 列表
  dependencies: string[];   // 依赖的任务 ID
  steps: TaskStep[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// 消息模型
export interface Message {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  type: 'text' | 'file' | 'command' | 'notification';
  timestamp: Date;
}

// 日志模型
export interface Log {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'system' | 'agent' | 'task' | 'user';
  sourceId?: string;      // 关联的 Agent/Task ID
  message: string;
  timestamp: Date;
}

// 面板模式
export type PanelMode = 'chat' | 'properties' | 'logs';

// 文件类型
export interface AgentFile {
  name: string;
  path: string;
  content: string;
  lastModified: Date;
}