import { create } from 'zustand';
import type { CommunicationScope, CommunicationPermission } from '../types';
import { toast } from './toastStore';

interface CommunicationState {
  // Communication scopes
  scopes: CommunicationScope[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadScopes: () => Promise<void>;
  addScope: (agentId: string, agentName: string, permission: CommunicationPermission) => Promise<void>;
  removeScope: (agentId: string) => Promise<void>;
  updatePermission: (agentId: string, permission: CommunicationPermission) => Promise<void>;
  clearAllScopes: () => Promise<void>;
}

// Mock initial scopes
const mockScopes: CommunicationScope[] = [
  {
    agentId: 'leader',
    agentName: '队长',
    permission: 'full',
    addedAt: new Date(Date.now() - 86400000 * 7),
    lastInteraction: new Date(Date.now() - 3600000),
  },
  {
    agentId: 'analyst',
    agentName: '分析师',
    permission: 'readwrite',
    addedAt: new Date(Date.now() - 86400000 * 5),
    lastInteraction: new Date(Date.now() - 7200000),
  },
  {
    agentId: 'designer',
    agentName: '设计师',
    permission: 'readonly',
    addedAt: new Date(Date.now() - 86400000 * 3),
  },
];

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  // Initial state
  scopes: [],
  isLoading: false,
  error: null,

  // Load communication scopes
  loadScopes: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ scopes: mockScopes, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load scopes';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
    }
  },

  // Add new communication scope
  addScope: async (agentId: string, agentName: string, permission: CommunicationPermission) => {
    const existing = get().scopes.find(s => s.agentId === agentId);
    if (existing) {
      toast.error('Agent already in communication scope');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newScope: CommunicationScope = {
        agentId,
        agentName,
        permission,
        addedAt: new Date(),
      };
      set(state => ({ scopes: [...state.scopes, newScope] }));
      toast.success(`Added ${agentName} to communication scope`);
    } catch (error) {
      toast.error('Failed to add scope');
    }
  },

  // Remove communication scope
  removeScope: async (agentId: string) => {
    const scope = get().scopes.find(s => s.agentId === agentId);
    if (!scope) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set(state => ({
        scopes: state.scopes.filter(s => s.agentId !== agentId),
      }));
      toast.success(`Removed ${scope.agentName} from communication scope`);
    } catch (error) {
      toast.error('Failed to remove scope');
    }
  },

  // Update permission for a scope
  updatePermission: async (agentId: string, permission: CommunicationPermission) => {
    const scope = get().scopes.find(s => s.agentId === agentId);
    if (!scope) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set(state => ({
        scopes: state.scopes.map(s =>
          s.agentId === agentId ? { ...s, permission } : s
        ),
      }));
      toast.success(`Updated permission for ${scope.agentName}`);
    } catch (error) {
      toast.error('Failed to update permission');
    }
  },

  // Clear all scopes
  clearAllScopes: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set({ scopes: [] });
      toast.success('Cleared all communication scopes');
    } catch (error) {
      toast.error('Failed to clear scopes');
    }
  },
}));