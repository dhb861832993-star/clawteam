import { useState } from 'react';
import { clsx } from 'clsx';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  installed: boolean;
}

interface AgentSkillsPanelProps {
  agentId: string;
  agentName: string;
}

// 预设技能库
const SKILL_LIBRARY: Skill[] = [
  { id: '1', name: 'coding-agent', description: '代码开发代理', category: '开发', installed: false },
  { id: '2', name: 'weather', description: '天气查询', category: '工具', installed: false },
  { id: '3', name: 'web-search', description: '网络搜索', category: '工具', installed: false },
  { id: '4', name: 'github', description: 'GitHub 操作', category: '开发', installed: false },
  { id: '5', name: 'browser', description: '浏览器自动化', category: '自动化', installed: false },
  { id: '6', name: 'file-ops', description: '文件操作', category: '工具', installed: false },
  { id: '7', name: 'exec', description: '命令执行', category: '工具', installed: false },
  { id: '8', name: 'memory', description: '记忆管理', category: '工具', installed: false },
];

export function AgentSkillsPanel({ agentId: _agentId, agentName }: AgentSkillsPanelProps) {
  const [skills, setSkills] = useState<Skill[]>(() => {
    // 初始化：给每个 Agent 默认安装一些技能
    return SKILL_LIBRARY.map((skill, index) => ({
      ...skill,
      installed: index < 3, // 前 3 个技能默认安装
    }));
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleToggleSkill = (skillId: string) => {
    setSkills(skills.map(skill =>
      skill.id === skillId ? { ...skill, installed: !skill.installed } : skill
    ));
  };

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))];

  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const installedCount = skills.filter(s => s.installed).length;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-sm font-mono text-white mb-2">
          {agentName} 的技能
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">已安装:</span>
          <span className="text-accent-green font-mono">{installedCount}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-400 font-mono">{skills.length}</span>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={clsx(
              'px-3 py-1 rounded-lg text-xs font-mono transition-all',
              selectedCategory === category
                ? 'bg-accent-orange text-dark-900 font-semibold'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            )}
          >
            {category === 'all' ? '全部' : category}
          </button>
        ))}
      </div>

      {/* 技能列表 */}
      <div className="space-y-2">
        {filteredSkills.map(skill => (
          <div
            key={skill.id}
            className={clsx(
              'p-3 rounded-lg border transition-all',
              skill.installed
                ? 'bg-accent-green/10 border-accent-green/50'
                : 'bg-dark-800 border-dark-600'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-white">{skill.name}</span>
                  <span className="text-xs text-gray-500">{skill.category}</span>
                </div>
                <p className="text-xs text-gray-400">{skill.description}</p>
              </div>
              <button
                onClick={() => handleToggleSkill(skill.id)}
                className={clsx(
                  'px-3 py-1 rounded text-xs font-mono transition-all',
                  skill.installed
                    ? 'bg-accent-red text-white hover:bg-accent-red/80'
                    : 'bg-accent-green text-dark-900 hover:bg-accent-green/80'
                )}
              >
                {skill.installed ? '移除' : '安装'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
