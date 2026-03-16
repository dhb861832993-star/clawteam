import { create } from 'zustand';
import type { Agent, Task, Message, Log, PanelMode, AgentFile, AgentStatus } from '../types';
import { fetchAgents, fetchAgentFile, saveAgentFile, sendMessageToAgent, fetchLogs, fetchGatewayStatus } from '../api';
import { toast } from './toastStore';

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
  startAgentPolling: () => void;
  stopAgentPolling: () => void;

  // Tasks
  tasks: Task[];
  currentTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;

  // Panel
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;

  // Messages (stored per agent)
  messages: Message[];
  messagesByAgent: Record<string, Message[]>;
  addMessage: (message: Message) => void;
  sendChatMessage: (agentId: string, message: string) => Promise<void>;
  clearMessages: () => void;

  // Logs
  logs: Log[];
  logsLoading: boolean;
  logFilter: {
    agentId?: string;
    level?: 'info' | 'warn' | 'error' | 'debug';
  };
  setLogFilter: (filter: { agentId?: string; level?: 'info' | 'warn' | 'error' | 'debug' }) => void;
  loadLogs: () => Promise<void>;
  startLogPolling: () => void;
  stopLogPolling: () => void;
  addLog: (log: Log) => void;

  // Files
  currentFile: AgentFile | null;
  fileLoading: boolean;
  fileSaving: boolean;
  fileError: string | null;
  setCurrentFile: (file: AgentFile | null) => void;
  loadAgentFile: (agentId: string, fileName: string) => Promise<void>;
  saveCurrentFile: (content: string) => Promise<boolean>;

  // File tabs
  fileTabs: string[];
  activeFileTab: string;
  setFileTabs: (tabs: string[]) => void;
  setActiveFileTab: (tab: string) => void;
}

// Polling intervals
let agentPollingInterval: ReturnType<typeof setInterval> | null = null;
let logPollingInterval: ReturnType<typeof setInterval> | null = null;

export const useAppStore = create<AppState>((set, get) => ({
  // Agents
  agents: [],
  selectedAgentId: null,
  isLoadingAgents: false,
  agentsError: null,
  setAgents: (agents) => set({ agents }),
  selectAgent: (id) => {
    const state = get();
    set({ selectedAgentId: id });
    
    // Load messages for the selected agent
    if (id && state.messagesByAgent[id]) {
      set({ messages: state.messagesByAgent[id] });
    } else {
      set({ messages: [] });
    }
    
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
      const errorMsg = error instanceof Error ? error.message : 'Failed to load agents';
      set({
        agentsError: errorMsg,
        isLoadingAgents: false
      });
      toast.error(errorMsg);
    }
  },
  startAgentPolling: () => {
    if (agentPollingInterval) return;
    agentPollingInterval = setInterval(async () => {
      try {
        const status = await fetchGatewayStatus();
        // Update agent statuses based on session activity
        const agents = get().agents;
        const updatedAgents = agents.map(agent => {
          const agentSession = status.sessions.byAgent?.find(s => s.agentId === agent.id);
          if (agentSession && agentSession.count > 0) {
            return { ...agent, status: 'working' as AgentStatus, updatedAt: new Date() };
          }
          return agent;
        });
        set({ agents: updatedAgents });
      } catch (error) {
        console.error('[Polling] Failed to update agent status:', error);
      }
    }, 5000);
  },
  stopAgentPolling: () => {
    if (agentPollingInterval) {
      clearInterval(agentPollingInterval);
      agentPollingInterval = null;
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
  messagesByAgent: {},
  addMessage: (message) => {
    const state = get();
    const agentId = state.selectedAgentId || 'unknown';
    
    // Update global messages
    set((state) => ({ messages: [...state.messages, message] }));
    
    // Update messages by agent
    set((state) => ({
      messagesByAgent: {
        ...state.messagesByAgent,
        [agentId]: [...(state.messagesByAgent[agentId] || []), message],
      },
    }));
  },
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
    
    // Also save to agent-specific messages
    set((state) => ({
      messagesByAgent: {
        ...state.messagesByAgent,
        [agentId]: [...(state.messagesByAgent[agentId] || []), userMessage],
      },
    }));

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
      
      // Also save to agent-specific messages
      set((state) => ({
        messagesByAgent: {
          ...state.messagesByAgent,
          [agentId]: [...(state.messagesByAgent[agentId] || []), agentMessage],
        },
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        agentId: 'system',
        agentName: 'System',
        content: `Failed to send message: ${errorMsg}`,
        type: 'notification',
        timestamp: new Date(),
      };
      set((state) => ({ messages: [...state.messages, errorMessage] }));
      
      // Also save to agent-specific messages
      set((state) => ({
        messagesByAgent: {
          ...state.messagesByAgent,
          [agentId]: [...(state.messagesByAgent[agentId] || []), errorMessage],
        },
      }));
      toast.error(`Failed to send message: ${errorMsg}`);
    }
  },
  clearMessages: () => set({ messages: [] }),

  // Logs
  logs: [],
  logsLoading: false,
  logFilter: {},
  setLogFilter: (filter) => set({ logFilter: filter }),
  loadLogs: async () => {
    set({ logsLoading: true });
    try {
      const logs = await fetchLogs(get().logFilter.agentId);
      set({ logs, logsLoading: false });
    } catch (error) {
      console.error('Failed to load logs:', error);
      set({ logsLoading: false });
    }
  },
  startLogPolling: () => {
    if (logPollingInterval) return;
    logPollingInterval = setInterval(async () => {
      try {
        const logs = await fetchLogs(get().logFilter.agentId);
        set({ logs });
      } catch (error) {
        console.error('[Polling] Failed to fetch logs:', error);
      }
    }, 3000);
  },
  stopLogPolling: () => {
    if (logPollingInterval) {
      clearInterval(logPollingInterval);
      logPollingInterval = null;
    }
  },
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),

  // Files
  currentFile: null,
  fileLoading: false,
  fileSaving: false,
  fileError: null,
  setCurrentFile: (file) => set({ currentFile: file }),
  loadAgentFile: async (agentId: string, fileName: string) => {
    set({ fileLoading: true, fileError: null });
    try {
      const file = await fetchAgentFile(agentId, fileName);
      if (file) {
        set({ currentFile: file, activeFileTab: fileName, fileLoading: false });
      } else {
        set({
          currentFile: { name: fileName, path: '', content: '# File not found', lastModified: new Date() },
          fileLoading: false,
          fileError: 'File not found'
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load file';
      set({ currentFile: null, fileLoading: false, fileError: errorMsg });
      toast.error(errorMsg);
    }
  },
  saveCurrentFile: async (content: string) => {
    const state = get();
    const { selectedAgentId, activeFileTab, currentFile } = state;

    if (!selectedAgentId || !activeFileTab || !currentFile) {
      toast.error('No file selected');
      return false;
    }

    set({ fileSaving: true });
    try {
      const success = await saveAgentFile(selectedAgentId, activeFileTab, content);
      if (success) {
        set({
          currentFile: {
            ...currentFile,
            content,
            lastModified: new Date(),
          },
          fileSaving: false,
        });
        toast.success(`${activeFileTab} saved successfully`);
      } else {
        set({ fileSaving: false });
        toast.error('Failed to save file');
      }
      return success;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save file';
      set({ fileSaving: false });
      toast.error(errorMsg);
      return false;
    }
  },

  // File tabs
  fileTabs: ['SOUL.md', 'AGENTS.md', 'TOOLS.md', 'MEMORY.md', 'HEARTBEAT.md'],
  activeFileTab: 'progress',
  setFileTabs: (tabs) => set({ fileTabs: tabs }),
  setActiveFileTab: (tab) => {
    set({ activeFileTab: tab });
    const { selectedAgentId } = get();
    // Don't load file for 'progress' or 'skills' tabs
    if (selectedAgentId && tab !== 'progress' && tab !== 'skills') {
      get().loadAgentFile(selectedAgentId, tab);
    }
  },
}));