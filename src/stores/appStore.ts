import { create } from 'zustand';
import type { Agent, Task, Message, Log, PanelMode, AgentFile, AgentStatus } from '../types';
import { fetchAgents, fetchAgentFile, saveAgentFile, sendMessageToAgent } from '../api';

interface AppState {
  // Agents
  agents: Agent[];
  selectedAgentId: string | null;
  isLoadingAgents: boolean;
  agentsError: string | null;
  setAgents: (agents: Agent[]) => void;
  selectAgent: (id: string | null) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  loadAgents: () => Promise<void>;

  // Tasks
  tasks: Task[];
  currentTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;

  // Panel
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  sendChatMessage: (agentId: string, message: string) => Promise<void>;
  clearMessages: () => void;

  // Logs
  logs: Log[];
  addLog: (log: Log) => void;

  // Files
  currentFile: AgentFile | null;
  setCurrentFile: (file: AgentFile | null) => void;
  loadAgentFile: (agentId: string, fileName: string) => Promise<void>;
  saveCurrentFile: (content: string) => Promise<boolean>;

  // File tabs
  fileTabs: string[];
  activeFileTab: string;
  setFileTabs: (tabs: string[]) => void;
  setActiveFileTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Agents
  agents: [],
  selectedAgentId: null,
  isLoadingAgents: false,
  agentsError: null,
  setAgents: (agents) => set({ agents }),
  selectAgent: (id) => {
    set({ selectedAgentId: id });
    // Clear messages when selecting a new agent
    set({ messages: [] });
    // Load the default file for the selected agent
    if (id) {
      get().loadAgentFile(id, 'SOUL.md');
    }
  },
  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, status, updatedAt: new Date() } : agent
      ),
    })),
  loadAgents: async () => {
    set({ isLoadingAgents: true, agentsError: null });
    try {
      const agents = await fetchAgents();
      set({ agents, isLoadingAgents: false });
    } catch (error) {
      set({
        agentsError: error instanceof Error ? error.message : 'Failed to load agents',
        isLoadingAgents: false
      });
    }
  },

  // Tasks
  tasks: [],
  currentTask: null,
  setTasks: (tasks) => set({ tasks }),
  setCurrentTask: (task) => set({ currentTask: task }),

  // Panel
  panelMode: 'properties',
  setPanelMode: (mode) => set({ panelMode: mode }),

  // Messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  sendChatMessage: async (agentId: string, message: string) => {
    const state = get();
    const agent = state.agents.find(a => a.id === agentId);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      agentId: 'user',
      agentName: 'You',
      content: message,
      type: 'text',
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, userMessage] }));

    try {
      const response = await sendMessageToAgent(agentId, message);

      // Add agent response
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        agentId,
        agentName: agent?.name || agentId,
        content: response.content,
        type: 'text',
        timestamp: new Date(),
      };
      set((state) => ({ messages: [...state.messages, agentMessage] }));
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        agentId: 'system',
        agentName: 'System',
        content: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'notification',
        timestamp: new Date(),
      };
      set((state) => ({ messages: [...state.messages, errorMessage] }));
    }
  },
  clearMessages: () => set({ messages: [] }),

  // Logs
  logs: [],
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),

  // Files
  currentFile: null,
  setCurrentFile: (file) => set({ currentFile: file }),
  loadAgentFile: async (agentId: string, fileName: string) => {
    try {
      const file = await fetchAgentFile(agentId, fileName);
      set({ currentFile: file, activeFileTab: fileName });
    } catch (error) {
      console.error('Failed to load file:', error);
      set({ currentFile: null });
    }
  },
  saveCurrentFile: async (content: string) => {
    const state = get();
    const { selectedAgentId, activeFileTab, currentFile } = state;

    if (!selectedAgentId || !activeFileTab || !currentFile) {
      return false;
    }

    try {
      const success = await saveAgentFile(selectedAgentId, activeFileTab, content);
      if (success) {
        set({
          currentFile: {
            ...currentFile,
            content,
            lastModified: new Date(),
          }
        });
      }
      return success;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  },

  // File tabs
  fileTabs: ['SOUL.md', 'AGENTS.md', 'TOOLS.md', 'MEMORY.md', 'HEARTBEAT.md'],
  activeFileTab: 'SOUL.md',
  setFileTabs: (tabs) => set({ fileTabs: tabs }),
  setActiveFileTab: (tab) => {
    set({ activeFileTab: tab });
    const { selectedAgentId } = get();
    if (selectedAgentId) {
      get().loadAgentFile(selectedAgentId, tab);
    }
  },
}));