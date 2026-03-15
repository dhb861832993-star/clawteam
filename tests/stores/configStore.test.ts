import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigStore } from '../../src/stores/configStore'

describe('Config Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useConfigStore.setState({
      retryConfig: {
        enabled: true,
        maxRetries: 3,
        retryInterval: 5,
        exponentialBackoff: true,
      },
      backupConfig: {
        enabled: true,
        autoBackup: true,
        backupInterval: 24,
        maxBackups: 10,
        lastBackup: new Date(Date.now() - 3600000),
      },
      backups: [
        { id: 'backup-1', createdAt: new Date(Date.now() - 86400000), size: '2.3 KB' },
        { id: 'backup-2', createdAt: new Date(Date.now() - 172800000), size: '2.1 KB' },
      ],
    })
  })

  it('should have initial state', () => {
    const state = useConfigStore.getState()
    expect(state.retryConfig.enabled).toBe(true)
    expect(state.retryConfig.maxRetries).toBe(3)
    expect(state.backupConfig.enabled).toBe(true)
    expect(state.backups).toHaveLength(2)
  })

  it('should update retry config', () => {
    useConfigStore.getState().updateRetryConfig({ maxRetries: 5 })
    expect(useConfigStore.getState().retryConfig.maxRetries).toBe(5)
    // Other properties should remain unchanged
    expect(useConfigStore.getState().retryConfig.enabled).toBe(true)
  })

  it('should update backup config', () => {
    useConfigStore.getState().updateBackupConfig({ backupInterval: 12 })
    expect(useConfigStore.getState().backupConfig.backupInterval).toBe(12)
  })

  it('should create backup', () => {
    const initialCount = useConfigStore.getState().backups.length
    useConfigStore.getState().createBackup()
    expect(useConfigStore.getState().backups.length).toBe(initialCount + 1)
  })

  it('should restore backup', () => {
    // This test mainly checks that the function runs without error
    useConfigStore.getState().restoreBackup('backup-1')
    // The actual restore functionality is mocked
  })
})