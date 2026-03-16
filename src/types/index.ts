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

// ============= Phase 2: Skills Management =============

// Skill 定义
export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  enabled: boolean;
  installed: boolean;
  source: 'builtin' | 'clawhub' | 'local';
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

// ClawHub Skill 列表项
export interface ClawHubSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  category: string;
  tags: string[];
}

// ============= Phase 2: Communication Scope =============

// 通信权限
export type CommunicationPermission = 'readonly' | 'readwrite' | 'full';

// 通信范围项
export interface CommunicationScope {
  agentId: string;
  agentName: string;
  permission: CommunicationPermission;
  addedAt: Date;
  lastInteraction?: Date;
}

// ============= Phase 2: Health Check =============

// 健康状态
export interface HealthStatus {
  agentId: string;
  isOnline: boolean;
  lastHeartbeat: Date | null;
  responseTime: number | null; // ms
  errorCount: number;
  lastError?: string;
}

// 心跳配置
export interface HeartbeatConfig {
  enabled: boolean;
  interval: number; // seconds
  timeout: number; // seconds
  retryCount: number;
}

// ============= Phase 2: Configuration =============

// 应用配置
export interface AppConfig {
  theme: 'dark' | 'light';
  language: 'zh' | 'en';
  heartbeat: HeartbeatConfig;
  retry: RetryConfig;
  backup: BackupConfig;
}

// 重试配置
export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  retryInterval: number; // seconds
  exponentialBackoff: boolean;
}

// 备份配置
export interface BackupConfig {
  enabled: boolean;
  autoBackup: boolean;
  backupInterval: number; // hours
  maxBackups: number;
  lastBackup?: Date;
}

// ============= Phase 2: Multi-Team =============

// 团队定义
export interface Team {
  id: string;
  name: string;
  description?: string;
  agents: string[]; // Agent IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// 团队切换状态
export interface TeamSwitchState {
  previousTeamId: string | null;
  currentTeamId: string;
  pendingTasks: string[];
  switchedAt: Date;
}

// ============= Phase 3: Workflow & Agent Collaboration =============

// 工作流节点类型
export type WorkflowNodeType = 'task' | 'decision' | 'parallel' | 'trigger' | 'end';

// 工作流节点状态
export type WorkflowNodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// 工作流节点
export interface WorkflowNodeData {
  id: string;
  name: string;
  type: WorkflowNodeType;
  status: WorkflowNodeStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentAvatar?: string;
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  output?: string;
  error?: string;
  dependencies: string[]; // 依赖的节点 ID
}

// 工作流边
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  animated?: boolean;
}

// 工作流执行实例
export interface WorkflowExecution {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  nodes: WorkflowNodeData[];
  edges: WorkflowEdge[];
  progress: number; // 0-100
  currentNodeId?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

// Agent 协作消息
export interface AgentCollaborationMessage {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  fromAgentAvatar: string;
  toAgentId: string;
  toAgentName: string;
  toAgentAvatar: string;
  type: 'task' | 'file' | 'message' | 'notification';
  content: string;
  status: 'pending' | 'delivered' | 'processing' | 'completed';
  timestamp: Date;
}

// Agent 协作关系
export interface AgentCollaborationEdge {
  source: string;
  target: string;
  messageCount: number;
  fileCount: number;
  lastActivity?: Date;
  active: boolean;
}

// 任务执行详情
export interface TaskExecutionDetail {
  taskId: string;
  taskName: string;
  workflowId?: string;
  workflowName?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'blocked';
  progress: number;
  currentNodeId?: string;
  currentNodeName?: string;
  currentAgentId?: string;
  currentAgentName?: string;
  currentAgentAvatar?: string;
  steps: TaskExecutionStep[];
  startedAt?: Date;
  completedAt?: Date;
  estimatedRemaining?: number; // seconds
}

// 任务执行步骤
export interface TaskExecutionStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  agentId?: string;
  agentName?: string;
  agentAvatar?: string;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  output?: string;
}