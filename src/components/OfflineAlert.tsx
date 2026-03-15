import { useState } from 'react';

interface Alert {
  id: string;
  agentId: string;
  agentName: string;
  type: 'offline' | 'high_load' | 'slow_response' | 'error';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export function OfflineAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      agentId: '4',
      agentName: '📊 分析师',
      type: 'offline',
      message: '分析师已离线超过 5 分钟',
      timestamp: new Date(Date.now() - 300000),
      acknowledged: false,
    },
    {
      id: '2',
      agentId: '2',
      agentName: '🦁 队长',
      type: 'high_load',
      message: '队长负载超过 80%',
      timestamp: new Date(Date.now() - 60000),
      acknowledged: true,
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'offline': return '🔴';
      case 'high_load': return '🟡';
      case 'slow_response': return '🐌';
      case 'error': return '⚠️';
      default: return '⚪';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'offline': return 'border-accent-red';
      case 'high_load': return 'border-accent-orange';
      case 'slow_response': return 'border-yellow-600';
      case 'error': return 'border-accent-red';
      default: return 'border-dark-600';
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-mono text-accent-orange">🚨 离线告警</h3>
        {unacknowledgedCount > 0 && (
          <span className="px-3 py-1 bg-accent-red text-white rounded-full text-xs font-mono">
            {unacknowledgedCount} 未处理
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center text-gray-500 font-mono">
          ✅ 暂无告警
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 bg-dark-700 rounded-lg border-l-4 ${getTypeColor(alert.type)} ${
                alert.acknowledged ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <p className="font-mono text-white">{alert.agentName}</p>
                    <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 bg-accent-orange text-dark-900 rounded-lg font-mono text-xs hover:bg-accent-orange/80"
                    >
                      已知
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="px-3 py-1 bg-dark-600 text-gray-300 rounded-lg font-mono text-xs hover:bg-dark-500"
                  >
                    忽略
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
