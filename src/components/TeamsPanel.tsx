import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useTeamStore } from '../stores/teamStore';
import { useAppStore } from '../stores/appStore';
import type { Team, Agent } from '../types';

interface TeamsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamsPanel({ isOpen, onClose }: TeamsPanelProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<string | null>(null);

  const {
    teams,
    currentTeamId,
    isLoading,
    loadTeams,
    createTeam,
    deleteTeam,
    switchTeam,
    addAgentToTeam,
    removeAgentFromTeam,
  } = useTeamStore();

  const { agents, loadAgents } = useAppStore();

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadTeams();
      loadAgents();
    }
  }, [isOpen, loadTeams, loadAgents]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    await createTeam(newTeamName.trim(), newTeamDesc.trim() || undefined);
    setNewTeamName('');
    setNewTeamDesc('');
    setShowCreateForm(false);
  };

  const handleSwitchTeam = async (teamId: string) => {
    await switchTeam(teamId);
    onClose(); // 切换团队后关闭面板
  };

  if (!isOpen) return null;

  const currentTeam = teams.find(t => t.id === currentTeamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[700px] h-[550px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-mono font-semibold text-accent-orange">Team Management</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {teams.length} teams · {currentTeam?.agents.length || 0} agents in current team
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

        <div className="flex flex-1 overflow-hidden">
          {/* Team List */}
          <div className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col">
            <div className="p-4 border-b border-dark-700">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm font-semibold hover:bg-accent-orange/90 transition-colors"
              >
                + Create Team
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <svg className="animate-spin h-6 w-6 text-accent-orange" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : (
                <div className="space-y-1">
                  {teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeamForEdit(team.id)}
                      className={clsx(
                        'w-full text-left p-3 rounded-lg transition-all',
                        team.id === currentTeamId
                          ? 'bg-accent-orange/20 border border-accent-orange/50'
                          : 'hover:bg-dark-700 border border-transparent',
                        selectedTeamForEdit === team.id && team.id !== currentTeamId && 'bg-dark-700'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-white">{team.name}</span>
                        {team.id === currentTeamId && (
                          <span className="text-xs font-mono text-accent-green">● ACTIVE</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {team.agents.length} agents
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showCreateForm ? (
              <CreateTeamForm
                name={newTeamName}
                description={newTeamDesc}
                onNameChange={setNewTeamName}
                onDescChange={setNewTeamDesc}
                onSubmit={handleCreateTeam}
                onCancel={() => {
                  setShowCreateForm(false);
                  setNewTeamName('');
                  setNewTeamDesc('');
                }}
              />
            ) : selectedTeamForEdit ? (
              <TeamDetails
                team={teams.find(t => t.id === selectedTeamForEdit)!}
                agents={agents}
                isCurrentTeam={selectedTeamForEdit === currentTeamId}
                onSwitch={() => handleSwitchTeam(selectedTeamForEdit)}
                onDelete={() => deleteTeam(selectedTeamForEdit)}
                onAddAgent={(agentId) => addAgentToTeam(selectedTeamForEdit, agentId)}
                onRemoveAgent={(agentId) => removeAgentFromTeam(selectedTeamForEdit, agentId)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl">👥</span>
                  <p className="text-gray-500 font-mono mt-2">Select a team to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Team Form
interface CreateTeamFormProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescChange: (desc: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function CreateTeamForm({ name, description, onNameChange, onDescChange, onSubmit, onCancel }: CreateTeamFormProps) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h3 className="text-white font-mono font-semibold mb-4">Create New Team</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-2">Team Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter team name..."
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => onDescChange(e.target.value)}
            placeholder="Enter team description..."
            rows={3}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange resize-none"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-sm hover:bg-dark-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!name.trim()}
            className={clsx(
              'flex-1 py-2 rounded-lg font-mono text-sm font-semibold transition-colors',
              name.trim()
                ? 'bg-accent-orange text-dark-900 hover:bg-accent-orange/90'
                : 'bg-dark-700 text-gray-500 cursor-not-allowed'
            )}
          >
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
}

// Team Details
interface TeamDetailsProps {
  team: Team;
  agents: Agent[];
  isCurrentTeam: boolean;
  onSwitch: () => void;
  onDelete: () => void;
  onAddAgent: (agentId: string) => void;
  onRemoveAgent: (agentId: string) => void;
}

function TeamDetails({ team, agents, isCurrentTeam, onSwitch, onDelete, onAddAgent, onRemoveAgent }: TeamDetailsProps) {
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');

  const teamAgents = agents.filter((a: Agent) => team.agents.includes(a.id));
  const availableAgents = agents.filter((a: Agent) => !team.agents.includes(a.id));

  const handleAddAgent = () => {
    if (selectedAgent) {
      onAddAgent(selectedAgent);
      setSelectedAgent('');
      setShowAddAgent(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-mono font-semibold text-lg">{team.name}</h3>
            {team.description && (
              <p className="text-xs text-gray-500 font-mono mt-1">{team.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs font-mono text-gray-500">
              <span>Created: {team.createdAt.toLocaleDateString()}</span>
              <span>Updated: {team.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {!isCurrentTeam && (
              <button
                onClick={onSwitch}
                className="px-4 py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm font-semibold hover:bg-accent-orange/90 transition-colors"
              >
                Switch to Team
              </button>
            )}
            {!isCurrentTeam && team.id !== 'team-default' && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-accent-red hover:bg-dark-700 rounded-lg font-mono text-sm transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-mono text-white">Team Members ({teamAgents.length})</h4>
          <button
            onClick={() => setShowAddAgent(!showAddAgent)}
            className="px-3 py-1 text-xs font-mono text-accent-orange hover:bg-dark-700 rounded transition-colors"
          >
            + Add Agent
          </button>
        </div>

        {/* Add Agent Form */}
        {showAddAgent && availableAgents.length > 0 && (
          <div className="mb-4 p-4 bg-dark-800 rounded-xl border border-dark-600">
            <div className="flex gap-2">
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm font-mono"
              >
                <option value="">Select Agent...</option>
                {availableAgents.map((agent: Agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.avatar} {agent.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddAgent}
                disabled={!selectedAgent}
                className={clsx(
                  'px-4 py-2 rounded-lg font-mono text-sm transition-colors',
                  selectedAgent
                    ? 'bg-accent-orange text-dark-900'
                    : 'bg-dark-600 text-gray-500 cursor-not-allowed'
                )}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Agent List */}
        {teamAgents.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl">👤</span>
            <p className="text-gray-500 font-mono text-sm mt-2">No agents in this team</p>
          </div>
        ) : (
          <div className="space-y-2">
            {teamAgents.map((agent: Agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-3 bg-dark-800 rounded-lg border border-dark-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-lg">
                    {agent.avatar}
                  </div>
                  <div>
                    <p className="text-white font-mono text-sm">{agent.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{agent.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveAgent(agent.id)}
                  className="p-2 rounded hover:bg-dark-700 transition-colors text-gray-400 hover:text-accent-red"
                  title="Remove from team"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Badge */}
      {isCurrentTeam && (
        <div className="px-6 py-3 bg-accent-green/10 border-t border-accent-green/30">
          <p className="text-xs font-mono text-accent-green text-center">
            ● This is your current active team
          </p>
        </div>
      )}
    </div>
  );
}

export default TeamsPanel;