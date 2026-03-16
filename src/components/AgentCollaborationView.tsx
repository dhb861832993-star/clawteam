import { useState, useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import type { AgentCollaborationMessage, AgentCollaborationEdge } from '../types';

interface AgentNode {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'working' | 'waiting' | 'offline' | 'error';
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface AgentCollaborationViewProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data
const mockAgents: AgentNode[] = [
  { id: 'agent-1', name: '队长', avatar: '🦁', role: 'leader', status: 'working', x: 400, y: 200, vx: 0, vy: 0 },
  { id: 'agent-2', name: '分析师', avatar: '🦊', role: 'analyst', status: 'online', x: 200, y: 350, vx: 0, vy: 0 },
  { id: 'agent-3', name: '创作者', avatar: '🐱', role: 'creator', status: 'working', x: 600, y: 350, vx: 0, vy: 0 },
  { id: 'agent-4', name: '设计师', avatar: '🎨', role: 'designer', status: 'waiting', x: 300, y: 500, vx: 0, vy: 0 },
  { id: 'agent-5', name: '工程师', avatar: '🐻', role: 'engineer', status: 'online', x: 500, y: 500, vx: 0, vy: 0 },
];

const mockEdges: AgentCollaborationEdge[] = [
  { source: 'agent-1', target: 'agent-2', messageCount: 12, fileCount: 3, active: true, lastActivity: new Date() },
  { source: 'agent-1', target: 'agent-3', messageCount: 8, fileCount: 2, active: true, lastActivity: new Date(Date.now() - 60000) },
  { source: 'agent-2', target: 'agent-3', messageCount: 5, fileCount: 1, active: true, lastActivity: new Date(Date.now() - 120000) },
  { source: 'agent-3', target: 'agent-4', messageCount: 3, fileCount: 2, active: false, lastActivity: new Date(Date.now() - 300000) },
  { source: 'agent-4', target: 'agent-5', messageCount: 1, fileCount: 0, active: false, lastActivity: new Date(Date.now() - 600000) },
  { source: 'agent-1', target: 'agent-5', messageCount: 6, fileCount: 4, active: true, lastActivity: new Date() },
];

const mockMessages: AgentCollaborationMessage[] = [
  { id: 'm1', fromAgentId: 'agent-1', fromAgentName: '队长', fromAgentAvatar: '🦁', toAgentId: 'agent-2', toAgentName: '分析师', toAgentAvatar: '🦊', type: 'task', content: '请分析市场数据', status: 'completed', timestamp: new Date(Date.now() - 300000) },
  { id: 'm2', fromAgentId: 'agent-2', fromAgentName: '分析师', fromAgentAvatar: '🦊', toAgentId: 'agent-3', toAgentName: '创作者', toAgentAvatar: '🐱', type: 'file', content: '调研报告.md', status: 'delivered', timestamp: new Date(Date.now() - 180000) },
  { id: 'm3', fromAgentId: 'agent-1', fromAgentName: '队长', fromAgentAvatar: '🦁', toAgentId: 'agent-3', toAgentName: '创作者', toAgentAvatar: '🐱', type: 'message', content: '开始创作内容', status: 'processing', timestamp: new Date(Date.now() - 60000) },
  { id: 'm4', fromAgentId: 'agent-3', fromAgentName: '创作者', fromAgentAvatar: '🐱', toAgentId: 'agent-4', toAgentName: '设计师', toAgentAvatar: '🎨', type: 'file', content: '文案草稿.md', status: 'pending', timestamp: new Date() },
];

const statusColors: Record<string, string> = {
  online: 'border-accent-green',
  working: 'border-accent-orange',
  waiting: 'border-blue-400',
  offline: 'border-gray-500',
  error: 'border-accent-red',
};

const statusGlow: Record<string, string> = {
  online: 'shadow-accent-green/30',
  working: 'shadow-accent-orange/30',
  waiting: 'shadow-blue-400/30',
  offline: '',
  error: 'shadow-accent-red/30',
};

export function AgentCollaborationView({ isOpen, onClose }: AgentCollaborationViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agents] = useState<AgentNode[]>(mockAgents);
  const [edges] = useState<AgentCollaborationEdge[]>(mockEdges);
  const [messages, setMessages] = useState<AgentCollaborationMessage[]>(mockMessages);
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<AgentNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'flow'>('graph');

  // Animate floating particles along edges
  const animationRef = useRef<number | undefined>(undefined);
  const particleOffset = useRef<number>(0);

  // Draw collaboration graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw edges
    edges.forEach(edge => {
      const source = agents.find(a => a.id === edge.source);
      const target = agents.find(a => a.id === edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);

      // Edge style
      ctx.strokeStyle = edge.active ? 'rgba(255, 165, 0, 0.6)' : 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = edge.active ? 3 : 1;
      ctx.stroke();

      // Animated particle
      if (edge.active) {
        const t = (Math.sin(particleOffset.current + edges.indexOf(edge)) + 1) / 2;
        const px = source.x + (target.x - source.x) * t;
        const py = source.y + (target.y - source.y) * t;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFA500';
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
        ctx.fill();
      }

      // Message count badge
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      ctx.fillStyle = 'rgba(42, 42, 42, 0.9)';
      ctx.beginPath();
      ctx.arc(midX, midY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = edge.active ? '#FFA500' : '#888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(edge.messageCount), midX, midY);
    });
  }, [agents, edges]);

  // Animation loop
  useEffect(() => {
    if (isOpen && viewMode === 'graph') {
      const animate = () => {
        particleOffset.current += 0.03;
        drawGraph();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, viewMode, drawGraph]);

  // Simulate incoming messages
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const randomEdge = edges[Math.floor(Math.random() * edges.length)];
      const source = agents.find(a => a.id === randomEdge.source);
      const target = agents.find(a => a.id === randomEdge.target);

      if (source && target) {
        const types: Array<'task' | 'file' | 'message' | 'notification'> = ['task', 'file', 'message', 'notification'];
        const newMessage: AgentCollaborationMessage = {
          id: `m-${Date.now()}`,
          fromAgentId: source.id,
          fromAgentName: source.name,
          fromAgentAvatar: source.avatar,
          toAgentId: target.id,
          toAgentName: target.name,
          toAgentAvatar: target.avatar,
          type: types[Math.floor(Math.random() * types.length)],
          content: `新消息 ${Math.floor(Math.random() * 100)}`,
          status: 'pending',
          timestamp: new Date(),
        };

        setMessages(prev => [newMessage, ...prev].slice(0, 20));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, agents, edges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[1200px] h-[750px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700 bg-gradient-to-r from-dark-800 to-dark-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-orange/20 border border-accent-orange/50 flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
            <div>
              <h2 className="text-lg font-mono font-semibold text-white">
                Agent 协作关系图
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                实时协作可视化 · 消息流转监控
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('graph')}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-mono transition-all',
                viewMode === 'graph'
                  ? 'bg-accent-orange text-dark-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-400'
              )}
            >
              📊 关系图
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-mono transition-all',
                viewMode === 'flow'
                  ? 'bg-accent-orange text-dark-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-400'
              )}
            >
              📨 消息流
            </button>
          </div>

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
          {viewMode === 'graph' ? (
            <>
              {/* Graph Canvas */}
              <div className="flex-1 relative">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />

                {/* Agent Nodes */}
                {agents.map(agent => (
                  <div
                    key={agent.id}
                    onMouseEnter={() => setHoveredAgent(agent)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    onClick={() => setSelectedAgent(agent)}
                    className={clsx(
                      'absolute cursor-pointer transition-all duration-300',
                      'flex flex-col items-center'
                    )}
                    style={{
                      left: agent.x - 40,
                      top: agent.y - 40,
                    }}
                  >
                    {/* Agent Card */}
                    <div
                      className={clsx(
                        'w-20 h-20 rounded-2xl flex items-center justify-center text-3xl',
                        'bg-dark-800 border-2 transition-all duration-300',
                        statusColors[agent.status],
                        (selectedAgent?.id === agent.id || hoveredAgent?.id === agent.id) && 'scale-110 shadow-lg',
                        agent.status !== 'offline' && `shadow-lg ${statusGlow[agent.status]}`
                      )}
                    >
                      {agent.avatar}
                    </div>

                    {/* Name Badge */}
                    <div
                      className={clsx(
                        'mt-2 px-3 py-1 rounded-lg text-xs font-mono',
                        'bg-dark-800 border border-dark-600',
                        selectedAgent?.id === agent.id ? 'text-accent-orange border-accent-orange/50' : 'text-gray-400'
                      )}
                    >
                      {agent.name}
                    </div>

                    {/* Status Pulse */}
                    {agent.status === 'working' && (
                      <div className="absolute w-24 h-24 rounded-full border-2 border-accent-orange/30 animate-ping" style={{ left: -8, top: -8 }} />
                    )}
                  </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 p-3 bg-dark-800/90 rounded-lg border border-dark-600">
                  <div className="text-xs text-gray-500 font-mono mb-2">状态图例</div>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent-green" />
                      <span className="text-gray-400">在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent-orange" />
                      <span className="text-gray-400">工作中</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                      <span className="text-gray-400">等待中</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                      <span className="text-gray-400">离线</span>
                    </div>
                  </div>
                </div>

                {/* Interaction Hint */}
                <div className="absolute top-4 left-4 p-2 bg-dark-800/80 rounded-lg border border-dark-600 text-xs text-gray-500 font-mono">
                  💡 点击节点查看详情
                </div>
              </div>

              {/* Agent Detail Panel */}
              <div className="w-[300px] border-l border-dark-700 bg-dark-850 flex flex-col">
                {selectedAgent ? (
                  <>
                    <div className="p-4 border-b border-dark-700">
                      <h3 className="text-sm font-mono font-semibold text-white">
                        Agent 详情
                      </h3>
                    </div>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {/* Avatar */}
                      <div className="flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-600">
                        <div className={clsx(
                          'w-16 h-16 rounded-xl flex items-center justify-center text-3xl',
                          'bg-dark-700 border-2',
                          statusColors[selectedAgent.status]
                        )}>
                          {selectedAgent.avatar}
                        </div>
                        <div>
                          <div className="text-white font-mono font-semibold">{selectedAgent.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{selectedAgent.role}</div>
                          <div className={clsx(
                            'mt-1 text-xs font-mono',
                            selectedAgent.status === 'working' && 'text-accent-orange',
                            selectedAgent.status === 'online' && 'text-accent-green',
                            selectedAgent.status === 'waiting' && 'text-blue-400',
                            selectedAgent.status === 'offline' && 'text-gray-500'
                          )}>
                            {selectedAgent.status.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Collaboration Stats */}
                      <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
                        <div className="text-xs text-gray-500 font-mono mb-2">协作统计</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-dark-700 rounded text-center">
                            <div className="text-lg font-mono font-bold text-accent-orange">
                              {edges.filter(e => e.source === selectedAgent.id || e.target === selectedAgent.id).length}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">连接数</div>
                          </div>
                          <div className="p-2 bg-dark-700 rounded text-center">
                            <div className="text-lg font-mono font-bold text-accent-green">
                              {edges.filter(e => e.source === selectedAgent.id || e.target === selectedAgent.id)
                                .reduce((sum, e) => sum + e.messageCount, 0)}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">消息数</div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Collaborators */}
                      <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
                        <div className="text-xs text-gray-500 font-mono mb-2">最近协作</div>
                        <div className="space-y-2">
                          {edges
                            .filter(e => e.source === selectedAgent.id || e.target === selectedAgent.id)
                            .slice(0, 3)
                            .map(edge => {
                              const otherId = edge.source === selectedAgent.id ? edge.target : edge.source;
                              const other = agents.find(a => a.id === otherId);
                              if (!other) return null;
                              return (
                                <div key={edge.source + edge.target} className="flex items-center gap-2 p-2 bg-dark-700 rounded">
                                  <span className="text-lg">{other.avatar}</span>
                                  <span className="text-xs font-mono text-gray-400 flex-1">{other.name}</span>
                                  <span className={clsx(
                                    'text-xs font-mono',
                                    edge.active ? 'text-accent-orange' : 'text-gray-500'
                                  )}>
                                    {edge.messageCount} 条
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-4xl mb-3">👆</div>
                      <p className="text-xs text-gray-500 font-mono">点击节点查看详情</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Message Flow View */
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-3">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={clsx(
                      'p-4 rounded-xl border transition-all duration-300',
                      'bg-gradient-to-r from-dark-800 to-dark-850',
                      message.status === 'processing' && 'border-accent-orange animate-pulse',
                      message.status === 'pending' && 'border-yellow-500/50',
                      message.status === 'completed' && 'border-accent-green/50',
                      message.status === 'delivered' && 'border-dark-600'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* From Agent */}
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center text-xl">
                          {message.fromAgentAvatar}
                        </div>
                        <div>
                          <div className="text-sm font-mono text-white">{message.fromAgentName}</div>
                          <div className="text-xs text-gray-500 font-mono">发送者</div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          'px-3 py-1 rounded text-xs font-mono',
                          message.type === 'task' && 'bg-accent-orange/20 text-accent-orange',
                          message.type === 'file' && 'bg-accent-green/20 text-accent-green',
                          message.type === 'message' && 'bg-blue-500/20 text-blue-400',
                          message.type === 'notification' && 'bg-purple-500/20 text-purple-400'
                        )}>
                          {message.type === 'task' && '📋 任务'}
                          {message.type === 'file' && '📄 文件'}
                          {message.type === 'message' && '💬 消息'}
                          {message.type === 'notification' && '🔔 通知'}
                        </div>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>

                      {/* To Agent */}
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center text-xl">
                          {message.toAgentAvatar}
                        </div>
                        <div>
                          <div className="text-sm font-mono text-white">{message.toAgentName}</div>
                          <div className="text-xs text-gray-500 font-mono">接收者</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-sm font-mono text-gray-400">
                        {message.content}
                      </div>

                      {/* Status & Time */}
                      <div className="text-right">
                        <div className={clsx(
                          'text-xs font-mono',
                          message.status === 'processing' && 'text-accent-orange',
                          message.status === 'pending' && 'text-yellow-400',
                          message.status === 'completed' && 'text-accent-green',
                          message.status === 'delivered' && 'text-gray-400'
                        )}>
                          {message.status === 'processing' && '⏳ 处理中'}
                          {message.status === 'pending' && '⏸ 等待'}
                          {message.status === 'completed' && '✓ 完成'}
                          {message.status === 'delivered' && '→ 已发送'}
                        </div>
                        <div className="text-xs text-gray-600 font-mono">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-700 bg-dark-800">
          <div className="flex items-center justify-between text-xs font-mono text-gray-500">
            <div className="flex items-center gap-4">
              <span>Agent: <span className="text-accent-orange">{agents.length}</span></span>
              <span>连接: <span className="text-accent-green">{edges.filter(e => e.active).length}</span></span>
              <span>消息: <span className="text-blue-400">{messages.length}</span></span>
            </div>
            <span>实时更新中...</span>
          </div>
        </div>
      </div>
    </div>
  );
}