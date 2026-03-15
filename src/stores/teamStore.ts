import { create } from 'zustand';
import type { Team, TeamSwitchState } from '../types';
import { toast } from './toastStore';

interface TeamState {
  // Teams
  teams: Team[];
  currentTeamId: string | null;
  isLoading: boolean;
  error: string | null;

  // Switch state
  switchState: TeamSwitchState | null;

  // Actions
  loadTeams: () => Promise<void>;
  createTeam: (name: string, description?: string) => Promise<void>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  switchTeam: (teamId: string) => Promise<void>;
  addAgentToTeam: (teamId: string, agentId: string) => Promise<void>;
  removeAgentFromTeam: (teamId: string, agentId: string) => Promise<void>;
}

// Mock teams
const mockTeams: Team[] = [
  {
    id: 'team-default',
    name: 'Default Team',
    description: 'Default team for all agents',
    agents: ['leader', 'analyst', 'designer', 'developer', 'tester'],
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 3600000),
    isActive: true,
  },
  {
    id: 'team-frontend',
    name: 'Frontend Team',
    description: 'UI/UX development team',
    agents: ['designer', 'developer'],
    createdAt: new Date(Date.now() - 86400000 * 14),
    updatedAt: new Date(Date.now() - 86400000),
    isActive: false,
  },
  {
    id: 'team-backend',
    name: 'Backend Team',
    description: 'API and infrastructure team',
    agents: ['analyst', 'developer', 'tester'],
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 7200000),
    isActive: false,
  },
];

export const useTeamStore = create<TeamState>((set, get) => ({
  // Initial state
  teams: [],
  currentTeamId: null,
  isLoading: false,
  error: null,
  switchState: null,

  // Load teams
  loadTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const activeTeam = mockTeams.find(t => t.isActive);
      set({
        teams: mockTeams,
        currentTeamId: activeTeam?.id || mockTeams[0]?.id || null,
        isLoading: false,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load teams';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
    }
  },

  // Create new team
  createTeam: async (name: string, description?: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name,
        description,
        agents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: false,
      };
      set(state => ({ teams: [...state.teams, newTeam] }));
      toast.success(`Team "${name}" created`);
    } catch (error) {
      toast.error('Failed to create team');
    }
  },

  // Update team
  updateTeam: async (id: string, updates: Partial<Team>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set(state => ({
        teams: state.teams.map(t =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        ),
      }));
      toast.success('Team updated');
    } catch (error) {
      toast.error('Failed to update team');
    }
  },

  // Delete team
  deleteTeam: async (id: string) => {
    const team = get().teams.find(t => t.id === id);
    if (!team) return;

    if (team.isActive) {
      toast.error('Cannot delete active team');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      set(state => ({
        teams: state.teams.filter(t => t.id !== id),
      }));
      toast.success(`Team "${team.name}" deleted`);
    } catch (error) {
      toast.error('Failed to delete team');
    }
  },

  // Switch to a different team
  switchTeam: async (teamId: string) => {
    const { teams, currentTeamId } = get();
    const newTeam = teams.find(t => t.id === teamId);

    if (!newTeam || teamId === currentTeamId) return;

    try {
      // Set switch state (for task continuity)
      const switchState: TeamSwitchState = {
        previousTeamId: currentTeamId,
        currentTeamId: teamId,
        pendingTasks: [], // Would be populated with actual pending tasks
        switchedAt: new Date(),
      };

      await new Promise(resolve => setTimeout(resolve, 300));

      set(state => ({
        teams: state.teams.map(t => ({
          ...t,
          isActive: t.id === teamId,
        })),
        currentTeamId: teamId,
        switchState,
      }));

      toast.success(`Switched to "${newTeam.name}"`);
    } catch (error) {
      toast.error('Failed to switch team');
    }
  },

  // Add agent to team
  addAgentToTeam: async (teamId: string, agentId: string) => {
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return;

    if (team.agents.includes(agentId)) {
      toast.error('Agent already in team');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set(state => ({
        teams: state.teams.map(t =>
          t.id === teamId
            ? { ...t, agents: [...t.agents, agentId], updatedAt: new Date() }
            : t
        ),
      }));
      toast.success('Agent added to team');
    } catch (error) {
      toast.error('Failed to add agent');
    }
  },

  // Remove agent from team
  removeAgentFromTeam: async (teamId: string, agentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set(state => ({
        teams: state.teams.map(t =>
          t.id === teamId
            ? { ...t, agents: t.agents.filter(a => a !== agentId), updatedAt: new Date() }
            : t
        ),
      }));
      toast.success('Agent removed from team');
    } catch (error) {
      toast.error('Failed to remove agent');
    }
  },
}));