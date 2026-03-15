import { useState, useEffect } from 'react';

interface HeaderProps {
  onOpenSkills?: () => void;
  onOpenSettings?: () => void;
  onOpenTeams?: () => void;
  currentTeamName?: string;
}

export function Header({ onOpenSkills, onOpenSettings, onOpenTeams, currentTeamName }: HeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="h-20 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-accent-orange/60 flex items-center justify-between px-8">
      {/* Title */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-3xl font-mono font-light tracking-widest text-accent-orange">
            AGENT MANAGEMENT
          </h1>
          <p className="text-xs font-mono tracking-widest text-gray-600 mt-1">
            SYSTEM MONITORING INTERFACE // V10
          </p>
        </div>

        {/* Team Selector */}
        {currentTeamName && (
          <button
            onClick={onOpenTeams}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-accent-orange/50 transition-all"
          >
            <span className="text-lg">👥</span>
            <span className="text-sm font-mono text-white">{currentTeamName}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Actions & Status */}
      <div className="flex items-center gap-6">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSkills}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-accent-orange/50 transition-all group"
            title="Skills Management"
          >
            <span className="text-lg">🧩</span>
            <span className="text-sm font-mono text-gray-400 group-hover:text-white transition-colors">Skills</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-accent-orange/50 transition-all group"
            title="Settings"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-sm font-mono text-gray-400 group-hover:text-white transition-colors">Settings</span>
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-accent-green animate-pulse glow-green" />
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-accent-green">SYSTEM ONLINE</p>
            <p className="text-xs font-mono text-gray-600">
              {dateStr} // {timeStr} CST
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}