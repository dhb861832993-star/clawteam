import { create } from 'zustand';
import type { HealthStatus, HeartbeatConfig } from '../types';

interface HealthState {
  // Health statuses
  healthStatuses: Map<string, HealthStatus>;
  heartbeatConfig: HeartbeatConfig;
  isMonitoring: boolean;

  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  checkHealth: (agentId: string) => Promise<HealthStatus>;
  checkAllHealth: () => Promise<void>;
  updateHeartbeatConfig: (config: Partial<HeartbeatConfig>) => void;
}

// Heartbeat monitoring interval
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

// Simulate health check
async function simulateHealthCheck(agentId: string): Promise<HealthStatus> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  // Simulate random health status (90% online)
  const isOnline = Math.random() > 0.1;
  const responseTime = isOnline ? Math.floor(50 + Math.random() * 150) : null;

  return {
    agentId,
    isOnline,
    lastHeartbeat: isOnline ? new Date() : null,
    responseTime,
    errorCount: isOnline ? 0 : Math.floor(Math.random() * 3) + 1,
    lastError: isOnline ? undefined : 'Connection timeout',
  };
}

export const useHealthStore = create<HealthState>((set, get) => ({
  // Initial state
  healthStatuses: new Map(),
  heartbeatConfig: {
    enabled: true,
    interval: 30, // seconds
    timeout: 10,
    retryCount: 3,
  },
  isMonitoring: false,

  // Start heartbeat monitoring
  startMonitoring: () => {
    if (heartbeatInterval) return;

    set({ isMonitoring: true });

    // Initial check
    get().checkAllHealth();

    // Setup interval
    const { interval } = get().heartbeatConfig;
    heartbeatInterval = setInterval(() => {
      get().checkAllHealth();
    }, interval * 1000);
  },

  // Stop heartbeat monitoring
  stopMonitoring: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    set({ isMonitoring: false });
  },

  // Check health for a specific agent
  checkHealth: async (agentId: string) => {
    const status = await simulateHealthCheck(agentId);
    set(state => {
      const newMap = new Map(state.healthStatuses);
      newMap.set(agentId, status);
      return { healthStatuses: newMap };
    });
    return status;
  },

  // Check health for all agents
  checkAllHealth: async () => {
    // This would normally iterate over all known agents
    // For now, it's called externally with agent IDs
  },

  // Update heartbeat config
  updateHeartbeatConfig: (config: Partial<HeartbeatConfig>) => {
    set(state => ({
      heartbeatConfig: { ...state.heartbeatConfig, ...config },
    }));

    // Restart monitoring with new config if enabled
    const { isMonitoring } = get();
    if (isMonitoring && heartbeatInterval) {
      get().stopMonitoring();
      get().startMonitoring();
    }
  },
}));