import { useState } from 'react';

interface PerformanceMetric {
  agentId: string;
  agentName: string;
  avgResponseTime: number;
  successRate: number;
  tasksCompleted: number;
  efficiency: number;
}

export function PerformanceMetrics() {
  const [metrics] = useState<PerformanceMetric[]>([
    { agentId: '1', agentName: '🐻 大熊', avgResponseTime: 45, successRate: 99.5, tasksCompleted: 156, efficiency: 95 },
    { agentId: '2', agentName: '🦁 队长', avgResponseTime: 120, successRate: 98.2, tasksCompleted: 234, efficiency: 88 },
    { agentId: '3', agentName: '🎨 设计师', avgResponseTime: 80, successRate: 99.8, tasksCompleted: 89, efficiency: 92 },
    { agentId: '4', agentName: '📊 分析师', avgResponseTime: 65, successRate: 99.1, tasksCompleted: 178, efficiency: 94 },
  ]);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-accent-green';
    if (efficiency >= 70) return 'text-accent-orange';
    return 'text-accent-red';
  };

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-600">
      <h3 className="text-lg font-mono text-accent-orange mb-4">📈 Agent 性能监控</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left py-3 px-4 font-mono text-sm text-gray-400">Agent</th>
              <th className="text-right py-3 px-4 font-mono text-sm text-gray-400">平均响应</th>
              <th className="text-right py-3 px-4 font-mono text-sm text-gray-400">成功率</th>
              <th className="text-right py-3 px-4 font-mono text-sm text-gray-400">完成任务</th>
              <th className="text-right py-3 px-4 font-mono text-sm text-gray-400">效能分</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.agentId} className="border-b border-dark-700">
                <td className="py-3 px-4 font-mono text-white">{metric.agentName}</td>
                <td className="py-3 px-4 text-right font-mono text-white">{metric.avgResponseTime}ms</td>
                <td className="py-3 px-4 text-right font-mono text-accent-green">{metric.successRate}%</td>
                <td className="py-3 px-4 text-right font-mono text-white">{metric.tasksCompleted}</td>
                <td className={`py-3 px-4 text-right font-mono ${getEfficiencyColor(metric.efficiency)}`}>
                  {metric.efficiency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-dark-900 rounded-lg border border-dark-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-mono text-accent-green">
              {Math.round(metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length)}%
            </p>
            <p className="text-xs text-gray-500">平均成功率</p>
          </div>
          <div>
            <p className="text-2xl font-mono text-accent-orange">
              {Math.round(metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length)}ms
            </p>
            <p className="text-xs text-gray-500">平均响应</p>
          </div>
          <div>
            <p className="text-2xl font-mono text-white">
              {metrics.reduce((sum, m) => sum + m.tasksCompleted, 0)}
            </p>
            <p className="text-xs text-gray-500">总任务数</p>
          </div>
          <div>
            <p className="text-2xl font-mono text-accent-orange">
              {Math.round(metrics.reduce((sum, m) => sum + m.efficiency, 0) / metrics.length)}
            </p>
            <p className="text-xs text-gray-500">平均效能</p>
          </div>
        </div>
      </div>
    </div>
  );
}
