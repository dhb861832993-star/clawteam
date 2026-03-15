import { create } from 'zustand';
import type { RetryConfig, BackupConfig } from '../types';
import { toast } from './toastStore';

interface ConfigState {
  // Retry config
  retryConfig: RetryConfig;

  // Backup config
  backupConfig: BackupConfig;

  // Backups
  backups: Array<{ id: string; createdAt: Date; size: string }>;

  // Actions
  updateRetryConfig: (config: Partial<RetryConfig>) => void;
  updateBackupConfig: (config: Partial<BackupConfig>) => void;
  saveConfig: () => Promise<void>;
  loadConfig: () => Promise<void>;
  exportConfig: () => void;
  importConfig: (file: File) => void;
  createBackup: () => void;
  restoreBackup: (backupId: string) => void;
}

// Mock backups
const mockBackups = [
  { id: 'backup-1', createdAt: new Date(Date.now() - 86400000), size: '2.3 KB' },
  { id: 'backup-2', createdAt: new Date(Date.now() - 172800000), size: '2.1 KB' },
];

export const useConfigStore = create<ConfigState>((set, get) => ({
  // Initial state
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

  backups: mockBackups,

  // Update retry config
  updateRetryConfig: (config) => {
    set(state => ({
      retryConfig: { ...state.retryConfig, ...config },
    }));
  },

  // Update backup config
  updateBackupConfig: (config) => {
    set(state => ({
      backupConfig: { ...state.backupConfig, ...config },
    }));
  },

  // Save config to openclaw.json
  saveConfig: async () => {
    try {
      const { retryConfig, backupConfig } = get();
      const config = {
        retry: retryConfig,
        backup: backupConfig,
        savedAt: new Date().toISOString(),
      };

      // In real implementation, this would save to openclaw.json via API
      console.log('[Config] Saving config:', config);
      await new Promise(resolve => setTimeout(resolve, 300));

      toast.success('Configuration saved');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  },

  // Load config from openclaw.json
  loadConfig: async () => {
    try {
      // In real implementation, this would load from openclaw.json via API
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('[Config] Config loaded');
    } catch (error) {
      toast.error('Failed to load configuration');
    }
  },

  // Export config as JSON file
  exportConfig: () => {
    const { retryConfig, backupConfig } = get();
    const config = {
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      retry: retryConfig,
      backup: backupConfig,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openclaw-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Configuration exported');
  },

  // Import config from JSON file
  importConfig: (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);

        if (config.retry) {
          set({ retryConfig: config.retry });
        }
        if (config.backup) {
          set({ backupConfig: config.backup });
        }

        toast.success('Configuration imported');
      } catch (error) {
        toast.error('Failed to import configuration: Invalid JSON');
      }
    };
    reader.readAsText(file);
  },

  // Create a backup
  createBackup: () => {
    const { backupConfig, backups } = get();

    const newBackup = {
      id: `backup-${Date.now()}`,
      createdAt: new Date(),
      size: '2.5 KB',
    };

    set({
      backups: [newBackup, ...backups.slice(0, backupConfig.maxBackups - 1)],
      backupConfig: { ...backupConfig, lastBackup: new Date() },
    });

    toast.success('Backup created');
  },

  // Restore from a backup
  restoreBackup: (backupId: string) => {
    const backup = get().backups.find(b => b.id === backupId);
    if (backup) {
      // In real implementation, this would restore from the backup file
      toast.success(`Restored from backup created at ${backup.createdAt.toLocaleString()}`);
    } else {
      toast.error('Backup not found');
    }
  },
}));