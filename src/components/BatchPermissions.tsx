import { useState } from 'react';

interface AgentPermission {
  agentId: string;
  agentName: string;
  canRead: boolean;
  canWrite: boolean;
  canExecute: boolean;
  canDelete: boolean;
}

export function BatchPermissions() {
  const [permissions, setPermissions] = useState<AgentPermission[]>([
    { agentId: '1', agentName: '🐻 大熊', canRead: true, canWrite: true, canExecute: true, canDelete: false },
    { agentId: '2', agentName: '🦁 队长', canRead: true, canWrite: true, canExecute: true, canDelete: true },
    { agentId: '3', agentName: '🎨 设计师', canRead: true, canWrite: true, canExecute: false, canDelete: false },
    { agentId: '4', agentName: '📊 分析师', canRead: true, canWrite: false, canExecute: false, canDelete: false },
  ]);

  const [selectAll, setSelectAll] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const handleToggleAgent = (agentId: string) => {
    setSelectedAgents(selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId]
    );
  };

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(permissions.map(p => p.agentId));
    }
    setSelectAll(!selectAll);
  };

  const handleBatchSetPermission = (permission: keyof Omit<AgentPermission, 'agentId' | 'agentName'>) => {
    setPermissions(permissions.map(p =>
      selectedAgents.includes(p.agentId) ? { ...p, [permission]: true } : p
    ));
  };

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-mono text-accent-orange">🔐 批量权限设置</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-mono text-gray-400">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleToggleAll}
              className="w-4 h-4 accent-accent-orange"
            />
            全选
          </label>
          <span className="text-sm font-mono text-gray-400">
            已选 {selectedAgents.length} 个
          </span>
        </div>
      </div>

      {/* 权限表格 */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left py-3 px-4 font-mono text-sm text-gray-400">Agent</th>
              <th className="text-center py-3 px-4 font-mono text-sm text-gray-400">读取</th>
              <th className="text-center py-3 px-4 font-mono text-sm text-gray-400">写入</th>
              <th className="text-center py-3 px-4 font-mono text-sm text-gray-400">执行</th>
              <th className="text-center py-3 px-4 font-mono text-sm text-gray-400">删除</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr
                key={perm.agentId}
                onClick={() => handleToggleAgent(perm.agentId)}
                className={`border-b border-dark-700 cursor-pointer ${
                  selectedAgents.includes(perm.agentId) ? 'bg-accent-orange/10' : ''
                }`}
              >
                <td className="py-3 px-4 font-mono text-white">{perm.agentName}</td>
                <td className="py-3 px-4 text-center">
                  <span className={perm.canRead ? 'text-accent-green' : 'text-gray-600'}>{perm.canRead ? '✅' : '❌'}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={perm.canWrite ? 'text-accent-green' : 'text-gray-600'}>{perm.canWrite ? '✅' : '❌'}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={perm.canExecute ? 'text-accent-green' : 'text-gray-600'}>{perm.canExecute ? '✅' : '❌'}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={perm.canDelete ? 'text-accent-green' : 'text-gray-600'}>{perm.canDelete ? '✅' : '❌'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 批量操作 */}
      {selectedAgents.length > 0 && (
        <div className="p-4 bg-dark-700 rounded-lg border border-dark-600">
          <p className="text-sm font-mono text-gray-400 mb-3">批量操作（已选 {selectedAgents.length} 个 Agent）</p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleBatchSetPermission('canRead')}
              className="px-4 py-2 bg-accent-green text-dark-900 rounded-lg font-mono text-sm hover:bg-accent-green/80"
            >
              ✅ 允许读取
            </button>
            <button
              onClick={() => handleBatchSetPermission('canWrite')}
              className="px-4 py-2 bg-accent-green text-dark-900 rounded-lg font-mono text-sm hover:bg-accent-green/80"
            >
              ✏️ 允许写入
            </button>
            <button
              onClick={() => handleBatchSetPermission('canExecute')}
              className="px-4 py-2 bg-accent-green text-dark-900 rounded-lg font-mono text-sm hover:bg-accent-green/80"
            >
              ▶️ 允许执行
            </button>
            <button
              onClick={() => handleBatchSetPermission('canDelete')}
              className="px-4 py-2 bg-accent-red text-white rounded-lg font-mono text-sm hover:bg-accent-red/80"
            >
              🗑️ 允许删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
