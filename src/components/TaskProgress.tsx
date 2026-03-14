import { clsx } from 'clsx';

interface TaskStep {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'pending';
}

interface TaskProgressProps {
  steps: TaskStep[];
  progress: number;
}

export function TaskProgress({ steps, progress }: TaskProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 font-mono tracking-widest">
          TASK PROGRESS
        </span>
        <span className="text-xs text-accent-orange font-mono">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-dark-700 rounded-full overflow-hidden mb-8">
        <div
          className="absolute h-full bg-accent-orange rounded-full transition-all duration-500 glow-orange"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            {/* Connector line */}
            {index > 0 && (
              <div
                className={clsx(
                  'absolute h-px w-24 -translate-y-4',
                  steps[index - 1].status === 'completed' ? 'bg-accent-green' : 'bg-dark-600'
                )}
                style={{ left: `calc(${(index - 1) * 20}% + 10%)` }}
              />
            )}

            {/* Step circle */}
            <div
              className={clsx(
                'w-4 h-4 rounded-full flex items-center justify-center mb-2',
                step.status === 'completed' && 'bg-accent-green glow-green',
                step.status === 'running' && 'bg-accent-orange glow-orange animate-pulse',
                step.status === 'pending' && 'bg-dark-600 border border-dark-500'
              )}
            >
              {step.status === 'completed' && (
                <svg className="w-2 h-2 text-dark-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Step label */}
            <span
              className={clsx(
                'text-xs font-mono',
                step.status === 'running' ? 'text-accent-orange' : 'text-gray-500'
              )}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 任务输入组件
export function TaskInput() {
  return (
    <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="✨ 输入任务，自动组建团队..."
          className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-accent-orange transition-colors"
        />
        <button className="px-6 py-3 bg-accent-orange text-dark-900 font-semibold rounded-lg hover:bg-orange-400 transition-colors font-mono text-sm">
          发送
        </button>
      </div>
      <div className="mt-3 text-xs text-gray-600 font-mono">
        💡 示例："我想做小红书地编分享，需要调研竞品和创作内容"
      </div>
    </div>
  );
}