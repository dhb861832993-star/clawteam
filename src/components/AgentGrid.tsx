import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { AgentCard } from './AgentCard';

export function AgentGrid() {
  const { agents, selectedAgentId, selectAgent, loadAgents, isLoadingAgents, agentsError } = useAppStore();

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  if (agentsError) {
    return (
      <div className="space-y-6">
        <div className="text-xs text-gray-500 font-mono tracking-widest">
          AGENT NETWORK
        </div>
        <div className="p-8 bg-dark-800 rounded-xl border border-accent-red text-center">
          <p className="text-accent-red font-mono text-sm">{agentsError}</p>
          <button
            onClick={() => loadAgents()}
            className="mt-4 px-4 py-2 bg-dark-700 text-gray-300 rounded-lg font-mono text-xs hover:bg-dark-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingAgents) {
    return (
      <div className="space-y-6">
        <div className="text-xs text-gray-500 font-mono tracking-widest">
          AGENT NETWORK
        </div>
        <div className="p-8 bg-dark-800 rounded-xl border border-dark-600 text-center">
          <div className="animate-pulse flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
            <span className="text-gray-500 font-mono text-sm">正在加载 Agent 列表...</span>
          </div>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-xs text-gray-500 font-mono tracking-widest">
          AGENT NETWORK
        </div>
        <div className="p-8 bg-dark-800 rounded-xl border border-dark-600 text-center">
          <p className="text-gray-500 font-mono text-sm">暂无 Agent</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="agent-panel">
      <div className="text-xs text-gray-500 font-mono tracking-widest flex items-center justify-between">
        <span>AGENT NETWORK</span>
        <span className="text-accent-green">{agents.length} 在线</span>
      </div>

      {/* Grid of agent cards */}
      <div className="grid grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgentId === agent.id}
            onClick={() => selectAgent(selectedAgentId === agent.id ? null : agent.id)}
          />
        ))}
      </div>
    </div>
  );
}