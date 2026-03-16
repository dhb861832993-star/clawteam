import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import type { TaskExecutionDetail, TaskExecutionStep } from '../types';

interface TaskProgressTrackerProps {
  taskId?: string;
  compact?: boolean;
}

// Mock data
const mockTaskExecution: TaskExecutionDetail = {
  taskId: 'task-001',
  taskName: '小红书内容创作',
  workflowId: 'wf-001',
  workflowName: '内容创作工作流',
  status: 'running',
  progress: 68,
  currentNodeId: 'step-3',
  currentNodeName: '内容创作',
  currentAgentId: 'agent-3',
  currentAgentName: '创作者',
  currentAgentAvatar: '🐱',
  steps: [
    { id: 'step-1', name: '市场调研', status: 'completed', agentId: 'agent-1', agentName: '队长', agentAvatar: '🦁', progress: 100 },
    { id: 'step-2', name: '竞品分析', status: 'completed', agentId: 'agent-2', agentName: '分析师', agentAvatar: '🦊', progress: 100, output: '分析报告.json' },
    { id: 'step-3', name: '内容创作', status: 'running', agentId: 'agent-3', agentName: '创作者', agentAvatar: '🐱', progress: 68 },
    { id: 'step-4', name: '封面设计', status: 'pending', agentId: 'agent-4', agentName: '设计师', agentAvatar: '🎨', progress: 0 },
    { id: 'step-5', name: '审核发布', status: 'pending', agentId: 'agent-1', agentName: '队长', agentAvatar: '🦁', progress: 0 },
  ],
  startedAt: new Date(Date.now() - 1800000),
  estimatedRemaining: 1200,
};

const stepStatusConfig: Record<TaskExecutionStep['status'], { color: string; bgColor: string; borderColor: string; icon: string }> = {
  pending: { color: 'text-gray-500', bgColor: 'bg-gray-600', borderColor: 'border-gray-600', icon: '○' },
  running: { color: 'text-accent-orange', bgColor: 'bg-accent-orange', borderColor: 'border-accent-orange', icon: '◐' },
  completed: { color: 'text-accent-green', bgColor: 'bg-accent-green', borderColor: 'border-accent-green', icon: '●' },
  failed: { color: 'text-accent-red', bgColor: 'bg-accent-red', borderColor: 'border-accent-red', icon: '✗' },
  skipped: { color: 'text-gray-400', bgColor: 'bg-gray-500', borderColor: 'border-gray-500', icon: '○' },
};

const taskStatusConfig: Record<TaskExecutionDetail['status'], { color: string; bgColor: string; label: string }> = {
  pending: { color: 'text-gray-400', bgColor: 'bg-gray-500/20', label: '等待中' },
  running: { color: 'text-accent-orange', bgColor: 'bg-accent-orange/20', label: '执行中' },
  completed: { color: 'text-accent-green', bgColor: 'bg-accent-green/20', label: '已完成' },
  failed: { color: 'text-accent-red', bgColor: 'bg-accent-red/20', label: '失败' },
  blocked: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: '阻塞' },
};

export function TaskProgressTracker({ taskId, compact = false }: TaskProgressTrackerProps) {
  const [execution, setExecution] = useState<TaskExecutionDetail | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Load task execution data
  useEffect(() => {
    // Simulate loading
    setExecution(mockTaskExecution);

    // Simulate progress updates
    const interval = setInterval(() => {
      setExecution(prev => {
        if (!prev || prev.status !== 'running') return prev;

        const steps = prev.steps.map(step => {
          if (step.status === 'running') {
            const newProgress = Math.min(100, step.progress + 2);
            return {
              ...step,
              progress: newProgress,
              status: newProgress >= 100 ? 'completed' as const : 'running' as const,
            };
          }
          if (step.status === 'pending') {
            // Check if previous step is completed
            const prevStep = prev.steps.find(s => s.id === String(Number(step.id.split('-')[1]) - 1).padStart(2, '0'));
            if (prevStep && prevStep.status === 'completed') {
              return { ...step, status: 'running' as const };
            }
          }
          return step;
        });

        const totalProgress = steps.reduce((sum, s) => sum + s.progress, 0) / steps.length;
        const runningStep = steps.find(s => s.status === 'running');
        const allCompleted = steps.every(s => s.status === 'completed');

        return {
          ...prev,
          steps,
          progress: Math.round(totalProgress),
          currentNodeId: runningStep?.id,
          currentNodeName: runningStep?.name,
          currentAgentId: runningStep?.agentId,
          currentAgentName: runningStep?.agentName,
          currentAgentAvatar: runningStep?.agentAvatar,
          status: allCompleted ? 'completed' : 'running',
          estimatedRemaining: allCompleted ? 0 : Math.max(0, (prev.estimatedRemaining || 0) - 3),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [taskId]);

  if (!execution) {
    return (
      <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-mono">加载任务进度...</span>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`;
  };

  // Compact version for sidebar
  if (compact) {
    return (
      <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-mono tracking-widest">任务进度</span>
          <span className={clsx('text-xs font-mono font-semibold', taskStatusConfig[execution.status].color)}>
            {taskStatusConfig[execution.status].label}
          </span>
        </div>

        {/* Task Name */}
        <h4 className="text-sm font-mono font-semibold text-white mb-2">{execution.taskName}</h4>

        {/* Progress Bar */}
        <div className="relative h-2 bg-dark-700 rounded-full overflow-hidden mb-3">
          <div
            className="absolute h-full bg-gradient-to-r from-accent-orange to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${execution.progress}%` }}
          />
        </div>

        {/* Current Step */}
        {execution.currentAgentName && (
          <div className="flex items-center gap-2 p-2 bg-dark-700 rounded-lg">
            <span className="text-lg">{execution.currentAgentAvatar}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-mono">当前步骤</div>
              <div className="text-xs font-mono text-white truncate">{execution.currentNodeName}</div>
            </div>
            <div className="text-xs font-mono text-accent-orange">{execution.progress}%</div>
          </div>
        )}

        {/* Estimated Time */}
        {execution.estimatedRemaining && execution.estimatedRemaining > 0 && (
          <div className="mt-2 text-xs text-gray-500 font-mono text-center">
            预计剩余: <span className="text-accent-orange">{formatTime(execution.estimatedRemaining)}</span>
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dark-700 bg-gradient-to-r from-dark-800 to-dark-850">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono font-semibold text-white">任务进度追踪</h3>
          <div className={clsx(
            'px-3 py-1 rounded-lg text-xs font-mono font-semibold',
            taskStatusConfig[execution.status].bgColor,
            taskStatusConfig[execution.status].color
          )}>
            {taskStatusConfig[execution.status].label}
          </div>
        </div>

        {/* Task Info */}
        <div className="text-lg font-mono font-semibold text-white mb-2">{execution.taskName}</div>
        {execution.workflowName && (
          <div className="text-xs text-gray-500 font-mono">
            工作流: <span className="text-accent-orange">{execution.workflowName}</span>
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-mono">总体进度</span>
          <span className="text-2xl font-mono font-bold text-accent-orange">{execution.progress}%</span>
        </div>
        <div className="relative h-3 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-accent-orange to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${execution.progress}%` }}
          />
          {/* Animated glow */}
          {execution.status === 'running' && (
            <div
              className="absolute h-full w-12 bg-accent-orange/50 blur-md rounded-full animate-pulse"
              style={{ left: `${Math.max(0, execution.progress - 15)}%` }}
            />
          )}
        </div>

        {/* Time Info */}
        <div className="flex items-center justify-between mt-3 text-xs font-mono text-gray-500">
          {execution.startedAt && (
            <span>开始: {execution.startedAt.toLocaleTimeString()}</span>
          )}
          {execution.estimatedRemaining && execution.estimatedRemaining > 0 && (
            <span>预计剩余: <span className="text-accent-orange">{formatTime(execution.estimatedRemaining)}</span></span>
          )}
        </div>
      </div>

      {/* Current Agent */}
      {execution.currentAgentName && (
        <div className="p-4 border-b border-dark-700 bg-dark-850">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-dark-700 border border-accent-orange/50 flex items-center justify-center text-2xl">
              {execution.currentAgentAvatar}
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-mono mb-1">当前执行 Agent</div>
              <div className="text-lg font-mono font-semibold text-white">{execution.currentAgentName}</div>
              <div className="text-xs text-accent-orange font-mono">{execution.currentNodeName}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-accent-orange">{execution.progress}%</div>
              <div className="text-xs text-gray-500 font-mono">步骤进度</div>
            </div>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="p-4">
        <div className="text-xs text-gray-500 font-mono mb-3 tracking-widest">执行步骤</div>
        <div className="space-y-2">
          {execution.steps.map((step, index) => {
            const config = stepStatusConfig[step.status];
            const isExpanded = expandedStep === step.id;
            const isCurrent = step.id === execution.currentNodeId;

            return (
              <div
                key={step.id}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className={clsx(
                  'p-3 rounded-lg cursor-pointer transition-all',
                  'border hover:border-dark-500',
                  isCurrent ? 'bg-accent-orange/10 border-accent-orange/30' : 'bg-dark-700 border-dark-600',
                  step.status === 'completed' && 'bg-accent-green/5 border-accent-green/20'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Step Number */}
                  <div className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold',
                    config.bgColor,
                    step.status === 'completed' && 'text-dark-900'
                  )}>
                    {index + 1}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-white">{step.name}</span>
                      <span className={clsx('text-xs font-mono', config.color)}>
                        {config.icon}
                      </span>
                    </div>

                    {/* Agent */}
                    {step.agentName && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm">{step.agentAvatar}</span>
                        <span className="text-xs text-gray-500 font-mono">{step.agentName}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  {step.status === 'running' && (
                    <div className="w-16">
                      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-orange rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-center text-accent-orange font-mono mt-1">{step.progress}%</div>
                    </div>
                  )}

                  {/* Status Badge */}
                  {step.status === 'completed' && (
                    <span className="text-xs font-mono text-accent-green">✓ 完成</span>
                  )}
                  {step.status === 'pending' && (
                    <span className="text-xs font-mono text-gray-500">等待</span>
                  )}
                  {step.status === 'failed' && (
                    <span className="text-xs font-mono text-accent-red">✗ 失败</span>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-dark-600 space-y-2">
                    {step.output && (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-gray-500">产出:</span>
                        <span className="text-accent-green">📄 {step.output}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-gray-500">进度:</span>
                      <div className="flex-1 h-1 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            step.status === 'completed' ? 'bg-accent-green' : 'bg-accent-orange'
                          )}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      <span className={step.status === 'completed' ? 'text-accent-green' : 'text-accent-orange'}>
                        {step.progress}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 border-t border-dark-700 bg-dark-850">
        <div className="flex items-center justify-between text-xs font-mono text-gray-500">
          <div className="flex items-center gap-4">
            <span>步骤: <span className="text-accent-orange">{execution.steps.length}</span></span>
            <span>完成: <span className="text-accent-green">{execution.steps.filter(s => s.status === 'completed').length}</span></span>
          </div>
          {execution.status === 'running' && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
              实时更新中
            </span>
          )}
        </div>
      </div>
    </div>
  );
}