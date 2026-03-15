import { useState } from 'react';

interface Task {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed';
  createdAt: Date;
}

export function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: '竞品分析报告', priority: 'high', status: 'running', createdAt: new Date() },
    { id: '2', name: '小红书内容创作', priority: 'medium', status: 'pending', createdAt: new Date() },
    { id: '3', name: '热点监控', priority: 'low', status: 'pending', createdAt: new Date() },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-accent-red';
      case 'medium': return 'text-accent-orange';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '⚪';
      default: return '⚪';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-mono text-accent-orange">📋 任务优先级队列</h3>
        <button className="px-4 py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm hover:bg-accent-orange/80">
          ➕ 添加任务
        </button>
      </div>

      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 bg-dark-700 rounded-lg border border-dark-600"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getPriorityIcon(task.priority)}</span>
              <div>
                <p className="font-mono text-white">{task.name}</p>
                <p className="text-xs text-gray-500">
                  {task.status === 'running' ? '🔄 执行中' : '⏳ 等待中'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-mono ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
              </span>
              <select
                value={task.priority}
                onChange={(e) => {
                  setTasks(tasks.map(t => 
                    t.id === task.id ? { ...t, priority: e.target.value as any } : t
                  ));
                }}
                className="px-3 py-1 bg-dark-800 border border-dark-600 rounded-lg font-mono text-sm text-white"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-dark-900 rounded-lg border border-dark-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-mono text-accent-orange">{tasks.filter(t => t.status === 'pending').length}</p>
            <p className="text-xs text-gray-500">待执行</p>
          </div>
          <div>
            <p className="text-2xl font-mono text-accent-green">{tasks.filter(t => t.status === 'running').length}</p>
            <p className="text-xs text-gray-500">执行中</p>
          </div>
          <div>
            <p className="text-2xl font-mono text-gray-400">{tasks.length}</p>
            <p className="text-xs text-gray-500">总计</p>
          </div>
        </div>
      </div>
    </div>
  );
}
