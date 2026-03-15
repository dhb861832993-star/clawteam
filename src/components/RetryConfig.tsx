import { useState } from 'react';

interface RetryConfigProps {
  taskId: string;
  onSave?: (config: RetryConfigData) => void;
}

interface RetryConfigData {
  maxRetries: number;
  retryInterval: number;
  exponentialBackoff: boolean;
  retryableErrors: string[];
}

export function RetryConfig({ taskId, onSave }: RetryConfigProps) {
  const [config, setConfig] = useState<RetryConfigData>({
    maxRetries: 3,
    retryInterval: 5,
    exponentialBackoff: true,
    retryableErrors: ['network', 'timeout'],
  });

  const handleSave = () => {
    console.log('保存重试配置:', taskId, config);
    onSave?.(config);
  };

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-600">
      <h3 className="text-lg font-mono text-accent-orange mb-4">🔄 自动重试配置</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-mono text-gray-400 mb-2">
            最大重试次数
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={config.maxRetries}
            onChange={(e) => setConfig({ ...config, maxRetries: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg font-mono text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-gray-400 mb-2">
            重试间隔（分钟）
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={config.retryInterval}
            onChange={(e) => setConfig({ ...config, retryInterval: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg font-mono text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="exponentialBackoff"
            checked={config.exponentialBackoff}
            onChange={(e) => setConfig({ ...config, exponentialBackoff: e.target.checked })}
            className="w-4 h-4 accent-accent-orange"
          />
          <label htmlFor="exponentialBackoff" className="text-sm font-mono text-gray-400">
            指数退避（间隔依次翻倍）
          </label>
        </div>

        <div>
          <label className="block text-sm font-mono text-gray-400 mb-2">
            可重试错误类型
          </label>
          <div className="space-y-2">
            {['network', 'timeout', 'rate_limit', 'server_error'].map((errorType) => (
              <label key={errorType} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.retryableErrors.includes(errorType)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setConfig({ ...config, retryableErrors: [...config.retryableErrors, errorType] });
                    } else {
                      setConfig({ ...config, retryableErrors: config.retryableErrors.filter(t => t !== errorType) });
                    }
                  }}
                  className="w-4 h-4 accent-accent-orange"
                />
                <span className="text-sm font-mono text-gray-400">{errorType}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm hover:bg-accent-orange/80"
        >
          💾 保存配置
        </button>
      </div>
    </div>
  );
}
