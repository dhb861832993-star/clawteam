import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useHealthStore } from '../stores/healthStore';
import { useConfigStore } from '../stores/configStore';
import type { HeartbeatConfig, RetryConfig, BackupConfig } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'health' | 'retry' | 'backup';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const {
    heartbeatConfig,
    updateHeartbeatConfig,
  } = useHealthStore();

  const {
    retryConfig,
    backupConfig,
    updateRetryConfig,
    updateBackupConfig,
    saveConfig,
    exportConfig,
    importConfig,
    createBackup,
    restoreBackup,
    backups,
  } = useConfigStore();

  // Load config on mount
  useEffect(() => {
    if (isOpen) {
      saveConfig();
    }
  }, [isOpen, saveConfig]);

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'health', label: 'Health Check', icon: '💓' },
    { id: 'retry', label: 'Auto Retry', icon: '🔄' },
    { id: 'backup', label: 'Backup', icon: '💾' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[700px] h-[550px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-mono font-semibold text-accent-orange">Settings</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Configure dashboard behavior
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
          {/* Sidebar */}
          <div className="w-48 bg-dark-800 border-r border-dark-700 p-4">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all',
                    activeTab === tab.id
                      ? 'bg-accent-orange text-dark-900 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <GeneralSettings />
            )}

            {activeTab === 'health' && (
              <HealthSettings
                config={heartbeatConfig}
                onUpdate={updateHeartbeatConfig}
              />
            )}

            {activeTab === 'retry' && (
              <RetrySettings
                config={retryConfig}
                onUpdate={updateRetryConfig}
              />
            )}

            {activeTab === 'backup' && (
              <BackupSettings
                config={backupConfig}
                onUpdate={updateBackupConfig}
                onExport={exportConfig}
                onImport={importConfig}
                onCreateBackup={createBackup}
                onRestoreBackup={restoreBackup}
                backups={backups}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-sm hover:bg-dark-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              saveConfig();
              onClose();
            }}
            className="px-4 py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm font-semibold hover:bg-accent-orange/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// General Settings
function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-mono font-semibold mb-4">Dashboard Settings</h3>
        <p className="text-gray-500 font-mono text-sm">
          General dashboard configuration options.
        </p>
      </div>

      <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
        <h4 className="text-sm font-mono text-white mb-2">Version Info</h4>
        <div className="space-y-2 text-xs font-mono text-gray-500">
          <div className="flex justify-between">
            <span>Dashboard Version:</span>
            <span className="text-accent-orange">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span>API Version:</span>
            <span className="text-accent-orange">v1</span>
          </div>
          <div className="flex justify-between">
            <span>Config File:</span>
            <span className="text-gray-400">openclaw.json</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
        <h4 className="text-sm font-mono text-white mb-2">Quick Actions</h4>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-xs hover:bg-dark-600 transition-colors">
            Reset to Defaults
          </button>
          <button className="px-3 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-xs hover:bg-dark-600 transition-colors">
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}

// Health Check Settings
interface HealthSettingsProps {
  config: HeartbeatConfig;
  onUpdate: (config: Partial<HeartbeatConfig>) => void;
}

function HealthSettings({ config, onUpdate }: HealthSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-mono font-semibold mb-4">Heartbeat Configuration</h3>
        <p className="text-gray-500 font-mono text-sm">
          Configure agent health monitoring settings.
        </p>
      </div>

      <div className="space-y-4">
        {/* Enable Heartbeat */}
        <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div>
            <h4 className="text-sm font-mono text-white">Enable Heartbeat</h4>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Monitor agent health status periodically
            </p>
          </div>
          <button
            onClick={() => onUpdate({ enabled: !config.enabled })}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              config.enabled ? 'bg-accent-green' : 'bg-dark-600'
            )}
          >
            <div className={clsx(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              config.enabled ? 'translate-x-7' : 'translate-x-1'
            )} />
          </button>
        </div>

        {/* Interval */}
        <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-mono text-white">Check Interval</h4>
            <span className="text-accent-orange font-mono text-sm">{config.interval}s</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="10"
            value={config.interval}
            onChange={(e) => onUpdate({ interval: parseInt(e.target.value) })}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-orange"
          />
          <div className="flex justify-between text-xs text-gray-500 font-mono mt-1">
            <span>10s</span>
            <span>120s</span>
          </div>
        </div>

        {/* Timeout */}
        <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-mono text-white">Timeout</h4>
            <span className="text-accent-orange font-mono text-sm">{config.timeout}s</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={config.timeout}
            onChange={(e) => onUpdate({ timeout: parseInt(e.target.value) })}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-orange"
          />
        </div>

        {/* Retry Count */}
        <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-mono text-white">Retry Count</h4>
            <span className="text-accent-orange font-mono text-sm">{config.retryCount}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={config.retryCount}
            onChange={(e) => onUpdate({ retryCount: parseInt(e.target.value) })}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-orange"
          />
        </div>
      </div>
    </div>
  );
}

// Retry Settings
interface RetrySettingsProps {
  config: RetryConfig;
  onUpdate: (config: Partial<RetryConfig>) => void;
}

function RetrySettings({ config, onUpdate }: RetrySettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-mono font-semibold mb-4">Auto Retry Configuration</h3>
        <p className="text-gray-500 font-mono text-sm">
          Configure automatic retry behavior for failed operations.
        </p>
      </div>

      <div className="space-y-4">
        {/* Enable Retry */}
        <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div>
            <h4 className="text-sm font-mono text-white">Enable Auto Retry</h4>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Automatically retry failed operations
            </p>
          </div>
          <button
            onClick={() => onUpdate({ enabled: !config.enabled })}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              config.enabled ? 'bg-accent-green' : 'bg-dark-600'
            )}
          >
            <div className={clsx(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              config.enabled ? 'translate-x-7' : 'translate-x-1'
            )} />
          </button>
        </div>

        {/* Max Retries */}
        <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-mono text-white">Max Retries</h4>
            <span className="text-accent-orange font-mono text-sm">{config.maxRetries}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={config.maxRetries}
            onChange={(e) => onUpdate({ maxRetries: parseInt(e.target.value) })}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-orange"
          />
        </div>

        {/* Retry Interval */}
        <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-mono text-white">Retry Interval</h4>
            <span className="text-accent-orange font-mono text-sm">{config.retryInterval}s</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={config.retryInterval}
            onChange={(e) => onUpdate({ retryInterval: parseInt(e.target.value) })}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-orange"
          />
        </div>

        {/* Exponential Backoff */}
        <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div>
            <h4 className="text-sm font-mono text-white">Exponential Backoff</h4>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Increase delay between retries exponentially
            </p>
          </div>
          <button
            onClick={() => onUpdate({ exponentialBackoff: !config.exponentialBackoff })}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              config.exponentialBackoff ? 'bg-accent-green' : 'bg-dark-600'
            )}
          >
            <div className={clsx(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              config.exponentialBackoff ? 'translate-x-7' : 'translate-x-1'
            )} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Backup Settings
interface BackupSettingsProps {
  config: BackupConfig;
  onUpdate: (config: Partial<BackupConfig>) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onCreateBackup: () => void;
  onRestoreBackup: (backupId: string) => void;
  backups: Array<{ id: string; createdAt: Date; size: string }>;
}

function BackupSettings({
  config,
  onUpdate,
  onExport,
  onImport,
  onCreateBackup,
  onRestoreBackup,
  backups,
}: BackupSettingsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-mono font-semibold mb-4">Backup & Restore</h3>
        <p className="text-gray-500 font-mono text-sm">
          Configure automatic backups and restore from backup files.
        </p>
      </div>

      <div className="space-y-4">
        {/* Enable Backup */}
        <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-600">
          <div>
            <h4 className="text-sm font-mono text-white">Enable Backup</h4>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Automatically backup configuration
            </p>
          </div>
          <button
            onClick={() => onUpdate({ enabled: !config.enabled })}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              config.enabled ? 'bg-accent-green' : 'bg-dark-600'
            )}
          >
            <div className={clsx(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              config.enabled ? 'translate-x-7' : 'translate-x-1'
            )} />
          </button>
        </div>

        {/* Export/Import */}
        <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
          <h4 className="text-sm font-mono text-white mb-3">Manual Export/Import</h4>
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="flex-1 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-xs hover:bg-dark-600 transition-colors"
            >
              📤 Export Config
            </button>
            <label className="flex-1 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-xs hover:bg-dark-600 transition-colors cursor-pointer text-center">
              📥 Import Config
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Create Backup */}
        <button
          onClick={onCreateBackup}
          className="w-full py-3 bg-accent-orange text-dark-900 rounded-xl font-mono text-sm font-semibold hover:bg-accent-orange/90 transition-colors"
        >
          💾 Create Backup Now
        </button>

        {/* Backup List */}
        {backups.length > 0 && (
          <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
            <h4 className="text-sm font-mono text-white mb-3">Recent Backups</h4>
            <div className="space-y-2">
              {backups.map(backup => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                >
                  <div>
                    <p className="text-xs font-mono text-gray-400">
                      {backup.createdAt.toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-gray-500">{backup.size}</p>
                  </div>
                  <button
                    onClick={() => onRestoreBackup(backup.id)}
                    className="px-3 py-1 text-xs font-mono text-accent-orange hover:bg-dark-600 rounded transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPanel;