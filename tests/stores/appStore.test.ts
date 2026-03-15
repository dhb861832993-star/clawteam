import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../../src/stores/appStore'

describe('App Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      agents: [],
      selectedAgentId: null,
      isLoadingAgents: false,
      agentsError: null,
      tasks: [],
      currentTask: null,
      panelMode: 'properties',
      messages: [],
      logs: [],
      logsLoading: false,
      logFilter: {},
      currentFile: null,
      fileLoading: false,
      fileSaving: false,
      fileError: null,
      fileTabs: ['SOUL.md', 'AGENTS.md', 'TOOLS.md', 'MEMORY.md', 'HEARTBEAT.md'],
      activeFileTab: 'SOUL.md',
    })
  })

  it('should have initial state', () => {
    const state = useAppStore.getState()
    expect(state.agents).toEqual([])
    expect(state.selectedAgentId).toBeNull()
    expect(state.isLoadingAgents).toBe(false)
    expect(state.agentsError).toBeNull()
    expect(state.panelMode).toBe('properties')
  })

  it('should set agents', () => {
    const mockAgents = [
      {
        id: 'agent-1',
        name: 'Test Agent',
        model: 'claude-sonnet-4-6',
        status: 'idle' as const,
        createdAt: new Date().toISOString(),
      },
    ]

    useAppStore.getState().setAgents(mockAgents)
    expect(useAppStore.getState().agents).toEqual(mockAgents)
  })

  it('should select agent', () => {
    useAppStore.getState().selectAgent('agent-1')
    expect(useAppStore.getState().selectedAgentId).toBe('agent-1')
  })

  it('should set panel mode', () => {
    useAppStore.getState().setPanelMode('logs')
    expect(useAppStore.getState().panelMode).toBe('logs')
  })

  it('should add message', () => {
    const mockMessage = {
      id: 'msg-1',
      agentId: 'agent-1',
      agentName: 'Test Agent',
      content: 'Hello',
      type: 'text' as const,
      timestamp: new Date(),
    }

    useAppStore.getState().addMessage(mockMessage)
    expect(useAppStore.getState().messages).toHaveLength(1)
    expect(useAppStore.getState().messages[0]).toEqual(mockMessage)
  })

  it('should clear messages', () => {
    const mockMessage = {
      id: 'msg-1',
      agentId: 'agent-1',
      agentName: 'Test Agent',
      content: 'Hello',
      type: 'text' as const,
      timestamp: new Date(),
    }

    useAppStore.getState().addMessage(mockMessage)
    useAppStore.getState().clearMessages()
    expect(useAppStore.getState().messages).toHaveLength(0)
  })

  it('should add log', () => {
    const mockLog = {
      id: 'log-1',
      agentId: 'agent-1',
      level: 'info' as const,
      message: 'Test log',
      timestamp: new Date(),
    }

    useAppStore.getState().addLog(mockLog)
    expect(useAppStore.getState().logs).toHaveLength(1)
  })

  it('should set log filter', () => {
    const filter = { agentId: 'agent-1', level: 'error' as const }
    useAppStore.getState().setLogFilter(filter)
    expect(useAppStore.getState().logFilter).toEqual(filter)
  })
})