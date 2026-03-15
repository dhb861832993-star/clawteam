import { create } from 'zustand';
import type { Skill, ClawHubSkill } from '../types';
import { toast } from './toastStore';

interface SkillsState {
  // Skills 列表
  skills: Skill[];
  isLoading: boolean;
  error: string | null;

  // ClawHub 市场
  clawHubSkills: ClawHubSkill[];
  isLoadingMarket: boolean;
  marketError: string | null;

  // 搜索过滤
  searchQuery: string;
  categoryFilter: string;

  // Actions
  loadSkills: () => Promise<void>;
  toggleSkill: (skillId: string) => Promise<void>;
  installSkill: (skillId: string) => Promise<void>;
  uninstallSkill: (skillId: string) => Promise<void>;
  loadClawHubMarket: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
}

// 模拟内置 Skills 数据
const mockSkills: Skill[] = [
  { id: 'simplify', name: 'Simplify', description: 'Review code for reuse, quality, and efficiency', version: '1.0.0', enabled: true, installed: true, source: 'builtin', category: 'code-review', tags: ['review', 'quality'] },
  { id: 'loop', name: 'Loop', description: 'Run commands on recurring intervals', version: '1.0.0', enabled: true, installed: true, source: 'builtin', category: 'automation', tags: ['automation', 'scheduling'] },
  { id: 'claude-api', name: 'Claude API', description: 'Build apps with Claude API or Anthropic SDK', version: '1.0.0', enabled: true, installed: true, source: 'builtin', category: 'development', tags: ['api', 'sdk'] },
  { id: 'git', name: 'Git Helper', description: 'Advanced git operations and workflow', version: '1.0.0', enabled: false, installed: true, source: 'builtin', category: 'vcs', tags: ['git', 'version-control'] },
  { id: 'test', name: 'Test Runner', description: 'Automated test execution and reporting', version: '1.0.0', enabled: true, installed: true, source: 'builtin', category: 'testing', tags: ['test', 'automation'] },
  { id: 'deploy', name: 'Deploy Helper', description: 'CI/CD deployment automation', version: '1.0.0', enabled: false, installed: true, source: 'builtin', category: 'devops', tags: ['deploy', 'ci-cd'] },
  { id: 'docs', name: 'Docs Generator', description: 'Auto-generate documentation', version: '1.0.0', enabled: true, installed: true, source: 'builtin', category: 'documentation', tags: ['docs', 'automation'] },
  { id: 'refactor', name: 'Refactor Assistant', description: 'Code refactoring suggestions', version: '1.0.0', enabled: true, installed: true, source: 'builtin', category: 'code-review', tags: ['refactor', 'quality'] },
  { id: 'security', name: 'Security Scanner', description: 'Code security vulnerability detection', version: '1.0.0', enabled: true, installed: true, source: 'builtin', category: 'security', tags: ['security', 'scan'] },
  { id: 'perf', name: 'Performance Analyzer', description: 'Code performance analysis', version: '1.0.0', enabled: false, installed: true, source: 'builtin', category: 'performance', tags: ['performance', 'optimize'] },
  // 添加更多模拟 Skills 达到 49 个
  ...Array.from({ length: 39 }, (_, i) => ({
    id: `skill-${i + 11}`,
    name: `Skill ${i + 11}`,
    description: `Description for skill ${i + 11}`,
    version: '1.0.0',
    enabled: i % 3 === 0,
    installed: true,
    source: 'builtin' as const,
    category: ['code-review', 'automation', 'development', 'testing', 'devops'][i % 5],
    tags: ['tool', 'utility'],
  })),
];

// 模拟 ClawHub 市场数据
const mockClawHubSkills: ClawHubSkill[] = [
  { id: 'ch-ai-helper', name: 'AI Helper Pro', description: 'Advanced AI assistance for coding', version: '2.1.0', author: 'ClawHub', downloads: 15234, rating: 4.8, category: 'ai', tags: ['ai', 'assistant'] },
  { id: 'ch-cloud', name: 'Cloud Deploy', description: 'One-click cloud deployment', version: '1.5.0', author: 'CloudMaster', downloads: 8721, rating: 4.5, category: 'devops', tags: ['cloud', 'deploy'] },
  { id: 'ch-data', name: 'Data Pipeline', description: 'Build data pipelines easily', version: '3.0.0', author: 'DataFlow', downloads: 12045, rating: 4.7, category: 'data', tags: ['data', 'pipeline'] },
  { id: 'ch-mobile', name: 'Mobile Builder', description: 'Cross-platform mobile development', version: '1.2.0', author: 'MobileDev', downloads: 5632, rating: 4.3, category: 'mobile', tags: ['mobile', 'cross-platform'] },
  { id: 'ch-api', name: 'API Designer', description: 'Design and document APIs', version: '2.0.0', author: 'APIMaster', downloads: 9876, rating: 4.6, category: 'api', tags: ['api', 'design'] },
];

export const useSkillsStore = create<SkillsState>((set, get) => ({
  // Initial state
  skills: [],
  isLoading: false,
  error: null,
  clawHubSkills: [],
  isLoadingMarket: false,
  marketError: null,
  searchQuery: '',
  categoryFilter: 'all',

  // Load installed skills
  loadSkills: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ skills: mockSkills, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load skills';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
    }
  },

  // Toggle skill enabled/disabled
  toggleSkill: async (skillId: string) => {
    const skill = get().skills.find(s => s.id === skillId);
    if (!skill) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      set(state => ({
        skills: state.skills.map(s =>
          s.id === skillId ? { ...s, enabled: !s.enabled } : s
        ),
      }));
      toast.success(`${skill.name} ${!skill.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle skill');
    }
  },

  // Install skill from ClawHub
  installSkill: async (skillId: string) => {
    const clawHubSkill = get().clawHubSkills.find(s => s.id === skillId);
    if (!clawHubSkill) return;

    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newSkill: Skill = {
        id: clawHubSkill.id,
        name: clawHubSkill.name,
        description: clawHubSkill.description,
        version: clawHubSkill.version,
        author: clawHubSkill.author,
        enabled: true,
        installed: true,
        source: 'clawhub',
        category: clawHubSkill.category,
        tags: clawHubSkill.tags,
      };
      set(state => ({
        skills: [...state.skills, newSkill],
        clawHubSkills: state.clawHubSkills.filter(s => s.id !== skillId),
      }));
      toast.success(`${clawHubSkill.name} installed successfully`);
    } catch (error) {
      toast.error('Failed to install skill');
    }
  },

  // Uninstall skill
  uninstallSkill: async (skillId: string) => {
    const skill = get().skills.find(s => s.id === skillId);
    if (!skill || skill.source === 'builtin') {
      toast.error('Cannot uninstall builtin skills');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set(state => ({
        skills: state.skills.filter(s => s.id !== skillId),
      }));
      toast.success(`${skill.name} uninstalled`);
    } catch (error) {
      toast.error('Failed to uninstall skill');
    }
  },

  // Load ClawHub market
  loadClawHubMarket: async () => {
    set({ isLoadingMarket: true, marketError: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ clawHubSkills: mockClawHubSkills, isLoadingMarket: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load market';
      set({ marketError: errorMsg, isLoadingMarket: false });
      toast.error(errorMsg);
    }
  },

  // Set search query
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  // Set category filter
  setCategoryFilter: (category: string) => set({ categoryFilter: category }),
}));