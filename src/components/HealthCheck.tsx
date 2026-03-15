import { useState } from 'react';

interface AgentHealth {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
  lastHeartbeat: Date;
  responseTime: number;
}

export function HealthCheck() {
  const [agents] = useState<AgentHealth[]>([
    { id: '1', name: '🐻 大熊', status: 'online', lastHeartbeat: new Date(), responseTime: 45 },
    { id: '2', name: '🦁 队长', status: 'busy', lastHeartbeat: new Date(), responseTime: 120 },
    { id: '3', name: '🎨 设计师', status: 'online', lastHeartbeat: new Date(), responseTime: 80 },
    { id: '4', name: '📊 分析师', status: 'offline', lastHeartbeat: new Date(Date.now() - 300000), responseTime: 0 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-accent-green';
      case 'busy': return 'text-accent-orange';
      case 'offline': return 'text-accent-red';
      default: return 'text-gray-400';
    }
  };

  const getTimeSinceHeartbeat = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}秒前`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
    return `${Math.floor(seconds / 3600)}小时前`;
  };

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-600">
      <h3 className="text-lg font-mono text-accent-orange mb-4">💓 Agent 健康检查</h3>

      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center justify-between p-4 bg-dark-700 rounded-lg border border-dark-600"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                agent.status === 'online' ? 'bg-accent-green animate-pulse' :
                agent.status === 'busy' ? 'bg-accent-orange' :
                'bg-accent-red'
              }`} />
              <span className="font-mono text-white">{agent.name}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className={`text-sm font-mono ${getStatusColor(agent.status)}`}>
                  {agent.status === 'online' ? '🟢 在线' : agent.status === 'busy' ? '🟡 忙碌' : '🔴 离线'}
                </p>
                <p className="text-xs text-gray-500">
                  心跳：{getTimeSinceHeartbeat(agent.lastHeartbeat)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-white">{agent.responseTime}ms</p>
                <p className="text-xs text-gray-500">响应时间</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-dark-900 rounded-lg border border-dark-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-mono text-accent-green">{agents.filter(a => a.status === 'online').length}</p>
            <p className="text-xs text-gray-500">在线</p>
          </div>
          <div>
            <p className="text-2xl font-mono text-accent-orange">{agents.filter(a => a.status === 'busy').length}</p>
            <p className="text-xs text-gray-500">忙碌</p>
          </div>
          <div>
            <p className="text-2xl font-mono text-accent-red">{agents.filter(a => a.status === 'offline').length}</p>
            <p className="text-xs text-gray-500">离线</p>
          </div>
        </div>
      </div>
    </div>
  );
}
