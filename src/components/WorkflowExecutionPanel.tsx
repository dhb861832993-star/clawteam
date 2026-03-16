import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import type { WorkflowExecution, WorkflowNodeData, WorkflowNodeStatus } from '../types';

interface WorkflowExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId?: string;
}

// Mock data for demo
const mockWorkflowExecution: WorkflowExecution = {
  id: 'wf-001',
  name: '小红书内容创作工作流',
  status: 'running',
  progress: 65,
  currentNodeId: 'node-3',
  startedAt: new Date(Date.now() - 1800000),
  nodes: [
    {
      id: 'node-1',
      name: '市场调研',
      type: 'task',
      status: 'completed',
      assignedAgentId: 'agent-1',
      assignedAgentName: '队长',
      assignedAgentAvatar: '🦁',
      progress: 100,
      dependencies: [],
      startedAt: new Date(Date.now() - 1800000),
      completedAt: new Date(Date.now() - 1200000),
      output: '调研报告.md',
    },
    {
      id: 'node-2',
      name: '竞品分析',
      type: 'task',
      status: 'completed',
      assignedAgentId: 'agent-2',
      assignedAgentName: '分析师',
      assignedAgentAvatar: '🦊',
      progress: 100,
      dependencies: ['node-1'],
      startedAt: new Date(Date.now() - 1200000),
      completedAt: new Date(Date.now() - 600000),
      output: '分析结果.json',
    },
    {
      id: 'node-3',
      name: '内容创作',
      type: 'task',
      status: 'running',
      assignedAgentId: 'agent-3',
      assignedAgentName: '创作者',
      assignedAgentAvatar: '🐱',
      progress: 45,
      dependencies: ['node-2'],
      startedAt: new Date(Date.now() - 600000),
    },
    {
      id: 'node-4',
      name: '设计封面',
      type: 'task',
      status: 'pending',
      assignedAgentId: 'agent-4',
      assignedAgentName: '设计师',
      assignedAgentAvatar: '🎨',
      progress: 0,
      dependencies: ['node-3'],
    },
    {
      id: 'node-5',
      name: '审核发布',
      type: 'task',
      status: 'pending',
      assignedAgentId: 'agent-1',
      assignedAgentName: '队长',
      assignedAgentAvatar: '🦁',
      progress: 0,
      dependencies: ['node-4'],
    },
  ],
  edges: [
    { id: 'e1', source: 'node-1', target: 'node-2', animated: false },
    { id: 'e2', source: 'node-2', target: 'node-3', animated: true },
    { id: 'e3', source: 'node-3', target: 'node-4', animated: false },
    { id: 'e4', source: 'node-4', target: 'node-5', animated: false },
  ],
  createdAt: new Date(Date.now() - 2000000),
};

const statusConfig: Record<WorkflowNodeStatus, { color: string; bgColor: string; borderColor: string; label: string }> = {
  pending: { color: 'text-gray-500', bgColor: 'bg-gray-600', borderColor: 'border-gray-600', label: '待执行' },
  running: { color: 'text-accent-orange', bgColor: 'bg-accent-orange', borderColor: 'border-accent-orange', label: '执行中' },
  completed: { color: 'text-accent-green', bgColor: 'bg-accent-green', borderColor: 'border-accent-green', label: '已完成' },
  failed: { color: 'text-accent-red', bgColor: 'bg-accent-red', borderColor: 'border-accent-red', label: '失败' },
  skipped: { color: 'text-gray-400', bgColor: 'bg-gray-500', borderColor: 'border-gray-500', label: '已跳过' },
};

export function WorkflowExecutionPanel({ isOpen, onClose, workflowId }: WorkflowExecutionPanelProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeData | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    if (isOpen && !workflowId) {
      setExecution(mockWorkflowExecution);

      // Simulate progress updates
      const interval = setInterval(() => {
        setExecution(prev => {
          if (!prev || prev.status !== 'running') return prev;

          const nodes = prev.nodes.map(node => {
            if (node.status === 'running') {
              const newProgress = Math.min(100, node.progress + 5);
              return {
                ...node,
                progress: newProgress,
                status: newProgress >= 100 ? 'completed' as const : 'running' as const,
                completedAt: newProgress >= 100 ? new Date() : undefined,
              };
            }
            return node;
          });

          // Check if we need to start next node
          const updatedNodes = nodes.map(node => {
            if (node.status === 'pending') {
              const deps = node.dependencies;
              const depsCompleted = deps.every(depId => {
                const dep = nodes.find(n => n.id === depId);
                return dep?.status === 'completed';
              });
              if (depsCompleted) {
                return { ...node, status: 'running' as const, startedAt: new Date() };
              }
            }
            return node;
          });

          // Calculate overall progress
          const totalProgress = updatedNodes.reduce((sum, n) => sum + n.progress, 0) / updatedNodes.length;
          const runningNode = updatedNodes.find(n => n.status === 'running');
          const allCompleted = updatedNodes.every(n => n.status === 'completed');

          return {
            ...prev,
            nodes: updatedNodes,
            progress: Math.round(totalProgress),
            currentNodeId: runningNode?.id,
            status: allCompleted ? 'completed' : 'running',
            completedAt: allCompleted ? new Date() : undefined,
          };
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isOpen, workflowId]);

  if (!isOpen) return null;

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return '-';
    const endTime = end || new Date();
    const seconds = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[1100px] h-[700px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700 bg-gradient-to-r from-dark-800 to-dark-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-orange/20 border border-accent-orange/50 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-lg font-mono font-semibold text-white">
                任务执行监控
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                {execution?.name || '加载中...'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {execution && (
            <div className={clsx(
              'px-4 py-2 rounded-lg font-mono text-xs font-semibold border',
              execution.status === 'running' && 'bg-accent-orange/20 text-accent-orange border-accent-orange/50',
              execution.status === 'completed' && 'bg-accent-green/20 text-accent-green border-accent-green/50',
              execution.status === 'failed' && 'bg-accent-red/20 text-accent-red border-accent-red/50',
              execution.status === 'paused' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
              execution.status === 'pending' && 'bg-gray-500/20 text-gray-400 border-gray-500/50'
            )}>
              {execution.status === 'running' && '⚡ 执行中'}
              {execution.status === 'completed' && '✓ 已完成'}
              {execution.status === 'failed' && '✗ 失败'}
              {execution.status === 'paused' && '⏸ 暂停'}
              {execution.status === 'pending' && '○ 等待中'}
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left - Execution Flow */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Overall Progress */}
            {execution && (
              <div className="mb-6 p-4 bg-dark-800 rounded-xl border border-dark-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 font-mono tracking-widest">总体进度</span>
                  <span className="text-xl font-mono font-bold text-accent-orange">{execution.progress}%</span>
                </div>
                <div className="relative h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-accent-orange to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${execution.progress}%` }}
                  />
                  {/* Glow effect */}
                  <div
                    className="absolute h-full w-20 bg-accent-orange/50 blur-md rounded-full transition-all duration-500"
                    style={{ left: `${Math.max(0, execution.progress - 10)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-mono">
                  <span>开始: {execution.startedAt?.toLocaleTimeString() || '-'}</span>
                  <span>耗时: {formatDuration(execution.startedAt, execution.completedAt)}</span>
                </div>
              </div>
            )}

            {/* Node List */}
            <div className="space-y-3">
              {execution?.nodes.map((node, index) => {
                const config = statusConfig[node.status];
                const isSelected = selectedNode?.id === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={clsx(
                      'relative p-4 rounded-xl cursor-pointer transition-all duration-300',
                      'bg-gradient-to-r from-dark-800 to-dark-850 border-2',
                      isSelected ? 'border-accent-orange shadow-lg shadow-accent-orange/20' : 'border-dark-600 hover:border-dark-500',
                      node.status === 'running' && 'ring-2 ring-accent-orange/30'
                    )}
                  >
                    {/* Status glow */}
                    {node.status === 'running' && (
                      <div className="absolute inset-0 rounded-xl bg-accent-orange/5 animate-pulse" />
                    )}

                    <div className="relative flex items-center gap-4">
                      {/* Step Number */}
                      <div className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-bold',
                        config.bgColor, config.color === 'text-accent-green' && 'text-dark-900'
                      )}>
                        {index + 1}
                      </div>

                      {/* Agent Avatar */}
                      {node.assignedAgentAvatar && (
                        <div className="w-10 h-10 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center text-xl">
                          {node.assignedAgentAvatar}
                        </div>
                      )}

                      {/* Node Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-mono font-semibold text-sm">{node.name}</span>
                          <span className={clsx('text-xs font-mono px-2 py-0.5 rounded', config.bgColor + '/20', config.color)}>
                            {config.label}
                          </span>
                        </div>

                        {node.assignedAgentName && (
                          <div className="text-xs text-gray-500 font-mono">
                            负责人: <span className="text-accent-orange">{node.assignedAgentName}</span>
                          </div>
                        )}

                        {/* Progress bar for running tasks */}
                        {node.status === 'running' && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent-orange rounded-full transition-all duration-300"
                                style={{ width: `${node.progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">{node.progress}%</div>
                          </div>
                        )}

                        {/* Output for completed tasks */}
                        {node.status === 'completed' && node.output && (
                          <div className="mt-1 text-xs text-accent-green font-mono">
                            📄 {node.output}
                          </div>
                        )}

                        {/* Error for failed tasks */}
                        {node.status === 'failed' && node.error && (
                          <div className="mt-1 text-xs text-accent-red font-mono">
                            ⚠️ {node.error}
                          </div>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="text-xs text-gray-600 font-mono">
                        {formatDuration(node.startedAt, node.completedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Details Panel */}
          <div className="w-[320px] border-l border-dark-700 bg-dark-850 flex flex-col">
            {selectedNode ? (
              <>
                <div className="p-4 border-b border-dark-700">
                  <h3 className="text-sm font-mono font-semibold text-white mb-1">
                    节点详情
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">{selectedNode.name}</p>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {/* Status */}
                  <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
                    <div className="text-xs text-gray-500 font-mono mb-1">状态</div>
                    <div className={clsx('font-mono font-semibold', statusConfig[selectedNode.status].color)}>
                      {statusConfig[selectedNode.status].label}
                    </div>
                  </div>

                  {/* Assigned Agent */}
                  {selectedNode.assignedAgentName && (
                    <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
                      <div className="text-xs text-gray-500 font-mono mb-2">负责人</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-lg">
                          {selectedNode.assignedAgentAvatar}
                        </div>
                        <span className="text-sm font-mono text-white">{selectedNode.assignedAgentName}</span>
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
                    <div className="text-xs text-gray-500 font-mono mb-2">进度</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-orange rounded-full transition-all"
                          style={{ width: `${selectedNode.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-accent-orange">{selectedNode.progress}%</span>
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
                    <div className="text-xs text-gray-500 font-mono mb-2">时间信息</div>
                    <div className="space-y-1 text-xs font-mono">
                      {selectedNode.startedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">开始时间</span>
                          <span className="text-gray-300">{selectedNode.startedAt.toLocaleTimeString()}</span>
                        </div>
                      )}
                      {selectedNode.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">完成时间</span>
                          <span className="text-gray-300">{selectedNode.completedAt.toLocaleTimeString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">耗时</span>
                        <span className="text-accent-orange">{formatDuration(selectedNode.startedAt, selectedNode.completedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dependencies */}
                  {selectedNode.dependencies.length > 0 && (
                    <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
                      <div className="text-xs text-gray-500 font-mono mb-2">依赖节点</div>
                      <div className="space-y-1">
                        {selectedNode.dependencies.map(depId => {
                          const dep = execution?.nodes.find(n => n.id === depId);
                          return dep ? (
                            <div key={depId} className="flex items-center gap-2 text-xs font-mono">
                              <span className={clsx('w-2 h-2 rounded-full', statusConfig[dep.status].bgColor)} />
                              <span className="text-gray-400">{dep.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Output */}
                  {selectedNode.output && (
                    <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
                      <div className="text-xs text-gray-500 font-mono mb-2">产出物</div>
                      <div className="flex items-center gap-2 text-xs font-mono text-accent-green">
                        <span>📄</span>
                        <span>{selectedNode.output}</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="text-4xl mb-3">👆</div>
                  <p className="text-xs text-gray-500 font-mono">点击左侧节点查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-700 bg-dark-800">
          <div className="flex items-center justify-between text-xs font-mono text-gray-500">
            <div className="flex items-center gap-4">
              <span>节点总数: <span className="text-accent-orange">{execution?.nodes.length || 0}</span></span>
              <span>已完成: <span className="text-accent-green">{execution?.nodes.filter(n => n.status === 'completed').length || 0}</span></span>
              <span>执行中: <span className="text-accent-orange">{execution?.nodes.filter(n => n.status === 'running').length || 0}</span></span>
            </div>
            <span>实时更新中...</span>
          </div>
        </div>
      </div>
    </div>
  );
}