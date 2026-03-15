import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useSkillsStore } from '../stores/skillsStore';
import type { Skill, ClawHubSkill } from '../types';

interface SkillsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabMode = 'installed' | 'market';

export function SkillsPanel({ isOpen, onClose }: SkillsPanelProps) {
  const [tab, setTab] = useState<TabMode>('installed');
  const {
    skills,
    isLoading,
    clawHubSkills,
    isLoadingMarket,
    searchQuery,
    categoryFilter,
    loadSkills,
    toggleSkill,
    installSkill,
    uninstallSkill,
    loadClawHubMarket,
    setSearchQuery,
    setCategoryFilter,
  } = useSkillsStore();

  // Load skills on mount
  useEffect(() => {
    if (isOpen) {
      loadSkills();
      if (tab === 'market') {
        loadClawHubMarket();
      }
    }
  }, [isOpen, loadSkills, tab, loadClawHubMarket]);

  // Get unique categories
  const categories = ['all', ...new Set(skills.map(s => s.category).filter(Boolean))];

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const enabledCount = skills.filter(s => s.enabled).length;
  const installedCount = skills.filter(s => s.installed).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[800px] h-[600px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-mono font-semibold text-accent-orange">Skills Management</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {installedCount} installed · {enabledCount} enabled
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

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-dark-700">
          <button
            onClick={() => setTab('installed')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-mono transition-all',
              tab === 'installed'
                ? 'bg-accent-orange text-dark-900 font-semibold'
                : 'bg-dark-800 text-gray-500 hover:text-gray-400'
            )}
          >
            Installed ({installedCount})
          </button>
          <button
            onClick={() => setTab('market')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-mono transition-all',
              tab === 'market'
                ? 'bg-accent-orange text-dark-900 font-semibold'
                : 'bg-dark-800 text-gray-500 hover:text-gray-400'
            )}
          >
            ClawHub Market
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-dark-700">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 pl-10 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {tab === 'installed' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'installed' && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-accent-orange" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-gray-500 font-mono">Loading skills...</span>
                  </div>
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-4xl">🔍</span>
                    <p className="text-gray-500 font-mono mt-2">No skills found</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredSkills.map(skill => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onToggle={() => toggleSkill(skill.id)}
                      onUninstall={() => uninstallSkill(skill.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'market' && (
            <>
              {isLoadingMarket ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-accent-orange" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-gray-500 font-mono">Loading market...</span>
                  </div>
                </div>
              ) : clawHubSkills.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-4xl">✅</span>
                    <p className="text-gray-500 font-mono mt-2">All available skills installed</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {clawHubSkills.map(skill => (
                    <ClawHubCard
                      key={skill.id}
                      skill={skill}
                      onInstall={() => installSkill(skill.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Installed Skill Card
interface SkillCardProps {
  skill: Skill;
  onToggle: () => void;
  onUninstall: () => void;
}

function SkillCard({ skill, onToggle, onUninstall }: SkillCardProps) {
  const sourceColors: Record<string, string> = {
    builtin: 'text-accent-green',
    clawhub: 'text-accent-orange',
    local: 'text-blue-400',
  };

  return (
    <div className={clsx(
      'p-4 rounded-xl border transition-all',
      skill.enabled
        ? 'bg-dark-800 border-dark-600'
        : 'bg-dark-800/50 border-dark-700 opacity-60'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-white font-mono font-semibold text-sm">{skill.name}</h3>
          <p className="text-xs text-gray-500 font-mono">v{skill.version}</p>
        </div>
        <span className={clsx('text-xs font-mono', sourceColors[skill.source])}>
          {skill.source}
        </span>
      </div>

      <p className="text-xs text-gray-400 font-mono mb-3 line-clamp-2">{skill.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {skill.tags?.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-dark-700 text-gray-500 rounded text-xs font-mono">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          className={clsx(
            'relative w-12 h-6 rounded-full transition-colors',
            skill.enabled ? 'bg-accent-green' : 'bg-dark-600'
          )}
        >
          <div className={clsx(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            skill.enabled ? 'translate-x-7' : 'translate-x-1'
          )} />
        </button>

        {skill.source !== 'builtin' && (
          <button
            onClick={onUninstall}
            className="px-3 py-1 text-xs font-mono text-accent-red hover:bg-dark-700 rounded transition-colors"
          >
            Uninstall
          </button>
        )}
      </div>
    </div>
  );
}

// ClawHub Market Card
interface ClawHubCardProps {
  skill: ClawHubSkill;
  onInstall: () => void;
}

function ClawHubCard({ skill, onInstall }: ClawHubCardProps) {
  return (
    <div className="p-4 rounded-xl bg-dark-800 border border-dark-600 hover:border-accent-orange/50 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-white font-mono font-semibold text-sm">{skill.name}</h3>
          <p className="text-xs text-gray-500 font-mono">by {skill.author}</p>
        </div>
        <span className="text-xs font-mono text-accent-orange">
          v{skill.version}
        </span>
      </div>

      <p className="text-xs text-gray-400 font-mono mb-3 line-clamp-2">{skill.description}</p>

      <div className="flex items-center gap-4 mb-3 text-xs font-mono text-gray-500">
        <span>⬇️ {skill.downloads.toLocaleString()}</span>
        <span>⭐ {skill.rating}</span>
        <span className="text-accent-orange">{skill.category}</span>
      </div>

      <button
        onClick={onInstall}
        className="w-full py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm font-semibold hover:bg-accent-orange/90 transition-colors"
      >
        Install
      </button>
    </div>
  );
}

export default SkillsPanel;