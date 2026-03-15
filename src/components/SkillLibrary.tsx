import { useState } from 'react';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  installed: boolean;
  version: string;
}

export function SkillLibrary() {
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'coding-agent', description: '代码开发代理', category: '开发', installed: true, version: '1.0.0' },
    { id: '2', name: 'weather', description: '天气查询', category: '工具', installed: true, version: '1.2.0' },
    { id: '3', name: 'github', description: 'GitHub 操作', category: '开发', installed: false, version: '2.0.0' },
    { id: '4', name: 'peekaboo', description: 'macOS UI 自动化', category: '自动化', installed: false, version: '1.1.0' },
    { id: '5', name: 'video-frames', description: '视频帧提取', category: '媒体', installed: false, version: '1.0.0' },
  ]);

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleInstall = (skillId: string) => {
    setSkills(skills.map(s => 
      s.id === skillId ? { ...s, installed: true } : s
    ));
  };

  const handleUninstall = (skillId: string) => {
    setSkills(skills.map(s => 
      s.id === skillId ? { ...s, installed: false } : s
    ));
  };

  const categories = Array.from(new Set(skills.map(s => s.category)));

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-600">
      <h3 className="text-lg font-mono text-accent-orange mb-4">🧩 技能库</h3>

      <div className="grid grid-cols-3 gap-4">
        {/* 技能列表 */}
        <div className="col-span-2 space-y-2">
          {categories.map(category => (
            <div key={category}>
              <h4 className="text-sm font-mono text-gray-400 mb-2">{category}</h4>
              {skills.filter(s => s.category === category).map(skill => (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSkill?.id === skill.id
                      ? 'bg-accent-orange/20 border-accent-orange'
                      : 'bg-dark-700 border-dark-600 hover:border-dark-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-white">{skill.name}</p>
                      <p className="text-xs text-gray-500">{skill.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      skill.installed
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-dark-600 text-gray-400'
                    }`}>
                      {skill.installed ? '✅ 已安装' : '⬇️ 安装'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 技能详情 */}
        <div className="col-span-1">
          {selectedSkill ? (
            <div className="p-4 bg-dark-700 rounded-lg border border-dark-600">
              <h4 className="font-mono text-white mb-2">{selectedSkill.name}</h4>
              <p className="text-sm text-gray-400 mb-4">{selectedSkill.description}</p>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">分类</span>
                  <span className="text-white">{selectedSkill.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">版本</span>
                  <span className="text-white">{selectedSkill.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">状态</span>
                  <span className={selectedSkill.installed ? 'text-accent-green' : 'text-gray-400'}>
                    {selectedSkill.installed ? '已安装' : '未安装'}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                {selectedSkill.installed ? (
                  <button
                    onClick={() => handleUninstall(selectedSkill.id)}
                    className="w-full px-4 py-2 bg-accent-red text-white rounded-lg font-mono text-sm hover:bg-accent-red/80"
                  >
                    🗑️ 卸载
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall(selectedSkill.id)}
                    className="w-full px-4 py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm hover:bg-accent-orange/80"
                  >
                    ⬇️ 安装
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 font-mono">
              选择一个技能查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
