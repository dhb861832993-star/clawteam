import { useState } from 'react';

interface AgentStatus {
  id: string;
  name: string;
  avatar: string;
  load: number;
  tasksCompleted: number;
  avgResponseTime: number;
  uptime: number;
}

export function AgentStatusPanel() {
  const [agents] = useState<AgentStatus[]>([
    { id: '1', name: '大熊', avatar: '🐻', load: 62, tasksCompleted: 156, avgResponseTime: 45, uptime: 99.5 },
    { id: '2', name: '队长', avatar: '🦁', load: 78, tasksCompleted: 234, avgResponseTime: 120, uptime: 98.2 },
    { id: '3', name: '设计师', avatar: '🐱', load: 45, tasksCompleted: 89, avgResponseTime: 80, uptime: 99.8 },
    { id: '4', name: '分析师', avatar: '🦉', load: 34, tasksCompleted: 178, avgResponseTime: 65, uptime: 99.1 },
  ]);

  const getLoadColor = (load: number) => {
    if (load < 50) return 'bg-accent-green';
    if (load < 80) return 'bg-accent-orange';
    return 'bg-accent-red';
  };

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-600">
      <h3 className="text-lg font-mono text-accent-orange mb-4">📊 Agent 状态监控</h3>

      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-4 bg-dark-700 rounded-lg border border-dark-600"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{agent.avatar}</span>
              <div>
                <p className="font-mono text-white">{agent.name}</p>
                <p className="text-xs text-gray-500">ID: {agent.id}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">负载</span>
                  <span className="text-gray-400">{agent.load}%</span>
                </div>
                <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getLoadColor(agent.load)} transition-all`}
                    style={{ width: `${agent.load}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">完成任务</p>
                  <p className="font-mono text-white">{agent.tasksCompleted}</p>
                </div>
                <div>
                  <p className="text-gray-500">平均响应</p>
                  <p className="font-mono text-white">{agent.avgResponseTime}ms</p>
                </div>
                <div>
                  <p className="text-gray-500">在线率</p>
                  <p className="font-mono text-accent-green">{agent.uptime}%</p>
                </div>
                <div>
                  <p className="text-gray-500">状态</p>
                  <p className={`font-mono ${agent.load < 80 ? 'text-accent-green' : 'text-accent-orange'}`}>
                    {agent.load < 80 ? '正常' : '高负载'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
