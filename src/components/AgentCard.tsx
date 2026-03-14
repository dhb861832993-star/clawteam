import type { Agent, AgentStatus } from '../types';
import { clsx } from 'clsx';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig: Record<AgentStatus, { color: string; bgColor: string; label: string; borderColor: string }> = {
  online: { color: 'text-accent-green', bgColor: 'bg-accent-green', label: '● ACTIVE', borderColor: 'border-accent-green' },
  working: { color: 'text-accent-orange', bgColor: 'bg-accent-orange', label: '● WORKING', borderColor: 'border-accent-orange' },
  waiting: { color: 'text-blue-400', bgColor: 'bg-blue-400', label: '● WAITING', borderColor: 'border-blue-400' },
  offline: { color: 'text-gray-500', bgColor: 'bg-gray-500', label: '● IDLE', borderColor: 'border-gray-600' },
  error: { color: 'text-accent-red', bgColor: 'bg-accent-red', label: '⚠ BLOCKED', borderColor: 'border-accent-red' },
};

export function AgentCard({ agent, isSelected, onClick }: AgentCardProps) {
  const config = statusConfig[agent.status];
  const isOffline = agent.status === 'offline';

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative p-5 rounded-2xl cursor-pointer transition-all duration-300',
        'bg-gradient-to-b from-dark-700 to-dark-800',
        'border-2 card-hover',
        isSelected ? 'border-accent-orange shadow-lg shadow-accent-orange/20' : config.borderColor,
        agent.status === 'error' && 'animate-pulse'
      )}
    >
      {/* Status indicator glow */}
      {!isOffline && (
        <div
          className={clsx(
            'absolute inset-0 rounded-2xl opacity-20 blur-xl',
            config.bgColor
          )}
        />
      )}

      {/* Top accent bar */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-1 rounded-t-2xl',
          config.bgColor,
          'opacity-60'
        )}
      />

      {/* Content */}
      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        <div
          className={clsx(
            'w-20 h-20 rounded-full flex items-center justify-center text-4xl',
            'bg-dark-900 border-2',
            config.borderColor
          )}
        >
          {agent.avatar}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Status dot */}
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                config.bgColor,
                !isOffline && 'animate-pulse'
              )}
            />
            <span className="text-white font-semibold font-mono text-sm">
              {agent.name}
            </span>
          </div>

          <span className={clsx('text-xs font-mono', config.color, agent.status === 'error' && 'font-bold')}>
            {config.label}
          </span>

          {/* Load bar */}
          <div className="mt-3">
            <div className="text-xs text-gray-500 font-mono mb-1">
              LOAD: {agent.load}%
            </div>
            <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  agent.load > 80 ? 'bg-accent-red' : agent.load > 50 ? 'bg-accent-orange' : 'bg-accent-green'
                )}
                style={{ width: `${agent.load}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}