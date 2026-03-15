import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useCommunicationStore } from '../stores/communicationStore';
import { useAppStore } from '../stores/appStore';
import type { CommunicationPermission } from '../types';

interface CommunicationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommunicationPanel({ isOpen, onClose }: CommunicationPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [newPermission, setNewPermission] = useState<CommunicationPermission>('readonly');

  const {
    scopes,
    isLoading,
    loadScopes,
    addScope,
    removeScope,
    updatePermission,
    clearAllScopes,
  } = useCommunicationStore();

  const { agents, loadAgents } = useAppStore();

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadScopes();
      loadAgents();
    }
  }, [isOpen, loadScopes, loadAgents]);

  // Get available agents (not already in scope)
  const availableAgents = agents.filter(
    agent => !scopes.find(s => s.agentId === agent.id)
  );

  // Permission config
  const permissionConfig: Record<CommunicationPermission, { color: string; label: string; description: string }> = {
    readonly: { color: 'text-blue-400', label: 'Read Only', description: 'Can only read messages' },
    readwrite: { color: 'text-accent-orange', label: 'Read/Write', description: 'Can read and send messages' },
    full: { color: 'text-accent-green', label: 'Full Access', description: 'Full control including configuration' },
  };

  const handleAddScope = async () => {
    if (!selectedAgent) return;
    const agent = agents.find(a => a.id === selectedAgent);
    if (agent) {
      await addScope(agent.id, agent.name, newPermission);
      setSelectedAgent('');
      setNewPermission('readonly');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[600px] h-[500px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-mono font-semibold text-accent-orange">Communication Scope</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Manage agent communication permissions
            </p>
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

        {/* Add New Scope */}
        <div className="px-6 py-4 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
            >
              <option value="">Select Agent...</option>
              {availableAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.avatar} {agent.name}
                </option>
              ))}
            </select>

            <select
              value={newPermission}
              onChange={(e) => setNewPermission(e.target.value as CommunicationPermission)}
              className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
            >
              <option value="readonly">Read Only</option>
              <option value="readwrite">Read/Write</option>
              <option value="full">Full Access</option>
            </select>

            <button
              onClick={handleAddScope}
              disabled={!selectedAgent}
              className={clsx(
                'px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all',
                selectedAgent
                  ? 'bg-accent-orange text-dark-900 hover:bg-accent-orange/90'
                  : 'bg-dark-700 text-gray-500 cursor-not-allowed'
              )}
            >
              Add
            </button>
          </div>
        </div>

        {/* Scope List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-accent-orange" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-500 font-mono">Loading...</span>
              </div>
            </div>
          ) : scopes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <span className="text-4xl">🔗</span>
                <p className="text-gray-500 font-mono mt-2">No communication scopes configured</p>
                <p className="text-gray-600 font-mono text-xs mt-1">Add agents to enable communication</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {scopes.map(scope => {
                const config = permissionConfig[scope.permission];
                return (
                  <div
                    key={scope.agentId}
                    className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-600 hover:border-dark-500 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-xl">
                        {agents.find(a => a.id === scope.agentId)?.avatar || '🤖'}
                      </div>
                      <div>
                        <h4 className="text-white font-mono font-semibold text-sm">{scope.agentName}</h4>
                        <p className="text-xs text-gray-500 font-mono">
                          Added {scope.addedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Permission Selector */}
                      <select
                        value={scope.permission}
                        onChange={(e) => updatePermission(scope.agentId, e.target.value as CommunicationPermission)}
                        className={clsx(
                          'bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm font-mono focus:outline-none',
                          config.color
                        )}
                      >
                        <option value="readonly">Read Only</option>
                        <option value="readwrite">Read/Write</option>
                        <option value="full">Full Access</option>
                      </select>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeScope(scope.agentId)}
                        className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-accent-red"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between">
          <div className="text-xs text-gray-500 font-mono">
            {scopes.length} agent{scopes.length !== 1 ? 's' : ''} in communication scope
          </div>
          {scopes.length > 0 && (
            <button
              onClick={clearAllScopes}
              className="px-4 py-2 text-xs font-mono text-accent-red hover:bg-dark-800 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Permission Legend */}
        <div className="px-6 py-3 bg-dark-800 border-t border-dark-700">
          <div className="flex items-center gap-6 text-xs font-mono">
            <span className="text-gray-500">Permissions:</span>
            {Object.entries(permissionConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={clsx('w-2 h-2 rounded-full', config.color.replace('text-', 'bg-'))} />
                <span className={config.color}>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunicationPanel;