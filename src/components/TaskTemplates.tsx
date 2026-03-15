import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useTemplateStore, getCategoryName, getRoleName } from '../stores/templateStore';
import type { TaskTemplate, TemplateCategory, TemplateWorkflowStep } from '../types/template';

interface TaskTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate?: (template: TaskTemplate) => void;
}

const CATEGORY_ICONS: Record<TemplateCategory, string> = {
  content: '✏️',
  analysis: '🔍',
  monitoring: '📡',
  report: '📊',
  custom: '⚙️',
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  content: 'text-blue-400',
  analysis: 'text-purple-400',
  monitoring: 'text-green-400',
  report: 'text-yellow-400',
  custom: 'text-gray-400',
};

export function TaskTemplates({ isOpen, onClose, onApplyTemplate }: TaskTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);

  const {
    templates,
    isLoading,
    loadTemplates,
    deleteTemplate,
    duplicateTemplate,
    applyTemplate,
  } = useTemplateStore();

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, loadTemplates]);

  // 筛选模板
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  // 分类统计
  const categories: (TemplateCategory | 'all')[] = ['all', 'content', 'analysis', 'monitoring', 'report', 'custom'];

  const handleApplyTemplate = (template: TaskTemplate) => {
    applyTemplate(template.id);
    onApplyTemplate?.(template);
    onClose();
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('确定要删除此模板吗？')) {
      await deleteTemplate(id);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(null);
      }
    }
  };

  const handleDuplicateTemplate = async (id: string) => {
    await duplicateTemplate(id);
  };

  if (!isOpen) return null;

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[900px] h-[650px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-mono font-semibold text-accent-orange">Task Templates</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {templates.length} templates · {templates.reduce((sum, t) => sum + t.usageCount, 0)} total uses
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
          {/* Left: Category Filter & Template List */}
          <div className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col">
            {/* Category Tabs */}
            <div className="p-3 border-b border-dark-700">
              <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={clsx(
                      'px-2 py-1 text-xs font-mono rounded transition-colors',
                      selectedCategory === cat
                        ? 'bg-accent-orange text-dark-900'
                        : 'bg-dark-700 text-gray-400 hover:text-white'
                    )}
                  >
                    {cat === 'all' ? '全部' : `${CATEGORY_ICONS[cat]} ${getCategoryName(cat)}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <svg className="animate-spin h-6 w-6 text-accent-orange" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-3xl">📋</span>
                    <p className="text-gray-500 font-mono text-sm mt-2">暂无模板</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={clsx(
                        'w-full text-left p-3 rounded-lg transition-all group',
                        selectedTemplateId === template.id
                          ? 'bg-accent-orange/20 border border-accent-orange/50'
                          : 'hover:bg-dark-700 border border-transparent'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{CATEGORY_ICONS[template.category]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              'text-sm font-mono font-medium truncate',
                              selectedTemplateId === template.id ? 'text-white' : 'text-gray-200'
                            )}>
                              {template.name}
                            </span>
                            {template.isPreset && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-dark-600 text-gray-400 rounded font-mono">
                                预设
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-0.5 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-gray-500">
                            <span>{template.workflow.length} 步骤</span>
                            <span>·</span>
                            <span>使用 {template.usageCount} 次</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create Button */}
            <div className="p-3 border-t border-dark-700">
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setSelectedTemplateId(null);
                  setEditingTemplate(null);
                }}
                className="w-full py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm font-semibold hover:bg-accent-orange/90 transition-colors"
              >
                + 创建自定义模板
              </button>
            </div>
          </div>

          {/* Right: Template Details / Create Form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showCreateForm ? (
              <CreateTemplateForm
                onClose={() => setShowCreateForm(false)}
                onSuccess={() => {
                  setShowCreateForm(false);
                  loadTemplates();
                }}
              />
            ) : editingTemplate ? (
              <EditTemplateForm
                template={editingTemplate}
                onClose={() => setEditingTemplate(null)}
                onSuccess={() => {
                  setEditingTemplate(null);
                  loadTemplates();
                }}
              />
            ) : selectedTemplate ? (
              <TemplateDetails
                template={selectedTemplate}
                onApply={() => handleApplyTemplate(selectedTemplate)}
                onEdit={() => setEditingTemplate(selectedTemplate)}
                onDelete={() => handleDeleteTemplate(selectedTemplate.id)}
                onDuplicate={() => handleDuplicateTemplate(selectedTemplate.id)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl">📋</span>
                  <p className="text-gray-500 font-mono mt-2">选择模板查看详情</p>
                  <p className="text-gray-600 font-mono text-xs mt-1">或创建自定义模板</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 模板详情组件
interface TemplateDetailsProps {
  template: TaskTemplate;
  onApply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function TemplateDetails({ template, onApply, onEdit, onDelete, onDuplicate }: TemplateDetailsProps) {
  const totalDuration = template.workflow.reduce((sum, step) => sum + step.estimatedDuration, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{CATEGORY_ICONS[template.category]}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-mono font-semibold text-lg">{template.name}</h3>
                {template.isPreset && (
                  <span className="text-xs px-2 py-0.5 bg-dark-700 text-gray-400 rounded font-mono">
                    预设模板
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 font-mono mt-1">{template.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono text-gray-500">
                <span className={CATEGORY_COLORS[template.category]}>
                  {getCategoryName(template.category)}
                </span>
                <span>·</span>
                <span>使用 {template.usageCount} 次</span>
                <span>·</span>
                <span>预计 {totalDuration} 分钟</span>
              </div>
            </div>
          </div>

          <button
            onClick={onApply}
            className="px-6 py-2.5 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm font-semibold hover:bg-accent-orange/90 transition-colors"
          >
            应用模板
          </button>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex-1 overflow-y-auto p-6">
        <h4 className="text-sm font-mono text-white mb-4">工作流步骤 ({template.workflow.length})</h4>
        <div className="space-y-3">
          {template.workflow.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-dark-800 rounded-xl border border-dark-600"
            >
              <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs font-mono text-gray-400">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-white font-mono text-sm">{step.stepName}</p>
                <div className="flex items-center gap-3 mt-1 text-xs font-mono text-gray-500">
                  <span>角色: {getRoleName(step.assignedRole)}</span>
                  <span>·</span>
                  <span>预计 {step.estimatedDuration} 分钟</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended Agents */}
        <div className="mt-6">
          <h4 className="text-sm font-mono text-white mb-3">推荐 Agent</h4>
          <div className="flex flex-wrap gap-2">
            {template.recommendedAgents.map(agent => (
              <span
                key={agent}
                className="px-3 py-1.5 bg-dark-700 rounded-lg text-sm font-mono text-gray-300"
              >
                {getRoleName(agent)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={onDuplicate}
            className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg font-mono text-sm hover:bg-dark-600 transition-colors"
          >
            复制
          </button>
          {!template.isPreset && (
            <>
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg font-mono text-sm hover:bg-dark-600 transition-colors"
              >
                编辑
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 text-accent-red hover:bg-dark-700 rounded-lg font-mono text-sm transition-colors"
              >
                删除
              </button>
            </>
          )}
        </div>
        <div className="text-xs font-mono text-gray-600">
          创建于 {template.createdAt.toLocaleDateString()} · 更新于 {template.updatedAt.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// 创建模板表单
interface CreateTemplateFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateTemplateForm({ onClose, onSuccess }: CreateTemplateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [workflow, setWorkflow] = useState<TemplateWorkflowStep[]>([
    { stepName: '', assignedRole: 'analyst', estimatedDuration: 30 }
  ]);
  const [recommendedAgents, setRecommendedAgents] = useState<string[]>([]);

  const { createTemplate } = useTemplateStore();

  const availableRoles = ['analyst', 'designer', 'writer', 'operator', 'support', 'developer', 'tester'];

  const addWorkflowStep = () => {
    setWorkflow([...workflow, { stepName: '', assignedRole: 'analyst', estimatedDuration: 30 }]);
  };

  const updateWorkflowStep = (index: number, updates: Partial<TemplateWorkflowStep>) => {
    setWorkflow(workflow.map((step, i) => i === index ? { ...step, ...updates } : step));
  };

  const removeWorkflowStep = (index: number) => {
    if (workflow.length > 1) {
      setWorkflow(workflow.filter((_, i) => i !== index));
    }
  };

  const toggleAgent = (agent: string) => {
    setRecommendedAgents(
      recommendedAgents.includes(agent)
        ? recommendedAgents.filter(a => a !== agent)
        : [...recommendedAgents, agent]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || workflow.some(s => !s.stepName.trim())) return;

    await createTemplate({
      name: name.trim(),
      description: description.trim(),
      category,
      workflow: workflow.filter(s => s.stepName.trim()),
      recommendedAgents,
    });
    onSuccess();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-dark-700">
        <h3 className="text-white font-mono font-semibold text-lg">创建自定义模板</h3>
        <p className="text-xs text-gray-500 font-mono mt-1">定义任务工作流程和推荐 Agent</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* 基本信息 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-500 mb-2">模板名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入模板名称..."
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 mb-2">描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="输入模板描述..."
              rows={2}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
              {(['content', 'analysis', 'monitoring', 'report', 'custom'] as TemplateCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-mono transition-colors',
                    category === cat
                      ? 'bg-accent-orange text-dark-900'
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  )}
                >
                  {CATEGORY_ICONS[cat]} {getCategoryName(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 工作流步骤 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-mono text-gray-500">工作流步骤 *</label>
            <button
              onClick={addWorkflowStep}
              className="text-xs font-mono text-accent-orange hover:text-accent-orange/80"
            >
              + 添加步骤
            </button>
          </div>
          <div className="space-y-2">
            {workflow.map((step, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-dark-800 rounded-lg border border-dark-600">
                <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs font-mono text-gray-400 shrink-0 mt-1">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={step.stepName}
                    onChange={e => updateWorkflowStep(index, { stepName: e.target.value })}
                    placeholder="步骤名称..."
                    className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
                  />
                  <div className="flex gap-2">
                    <select
                      value={step.assignedRole}
                      onChange={e => updateWorkflowStep(index, { assignedRole: e.target.value })}
                      className="flex-1 bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-white text-sm font-mono"
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{getRoleName(role)}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={step.estimatedDuration}
                      onChange={e => updateWorkflowStep(index, { estimatedDuration: parseInt(e.target.value) || 0 })}
                      placeholder="分钟"
                      min={1}
                      className="w-20 bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-white text-sm font-mono"
                    />
                    <span className="text-xs text-gray-500 self-center">分钟</span>
                  </div>
                </div>
                {workflow.length > 1 && (
                  <button
                    onClick={() => removeWorkflowStep(index)}
                    className="p-1.5 rounded hover:bg-dark-700 transition-colors text-gray-500 hover:text-accent-red"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 推荐 Agent */}
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-3">推荐 Agent</label>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map(role => (
              <button
                key={role}
                onClick={() => toggleAgent(role)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-mono transition-colors',
                  recommendedAgents.includes(role)
                    ? 'bg-accent-orange text-dark-900'
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                )}
              >
                {getRoleName(role)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-dark-700 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-sm hover:bg-dark-600 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || workflow.some(s => !s.stepName.trim())}
          className={clsx(
            'flex-1 py-2 rounded-lg font-mono text-sm font-semibold transition-colors',
            name.trim() && !workflow.some(s => !s.stepName.trim())
              ? 'bg-accent-orange text-dark-900 hover:bg-accent-orange/90'
              : 'bg-dark-700 text-gray-500 cursor-not-allowed'
          )}
        >
          创建模板
        </button>
      </div>
    </div>
  );
}

// 编辑模板表单
interface EditTemplateFormProps {
  template: TaskTemplate;
  onClose: () => void;
  onSuccess: () => void;
}

function EditTemplateForm({ template, onClose, onSuccess }: EditTemplateFormProps) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [category, setCategory] = useState<TemplateCategory>(template.category);
  const [workflow, setWorkflow] = useState<TemplateWorkflowStep[]>(template.workflow);
  const [recommendedAgents, setRecommendedAgents] = useState<string[]>(template.recommendedAgents);

  const { updateTemplate } = useTemplateStore();

  const availableRoles = ['analyst', 'designer', 'writer', 'operator', 'support', 'developer', 'tester'];

  const addWorkflowStep = () => {
    setWorkflow([...workflow, { stepName: '', assignedRole: 'analyst', estimatedDuration: 30 }]);
  };

  const updateWorkflowStep = (index: number, updates: Partial<TemplateWorkflowStep>) => {
    setWorkflow(workflow.map((step, i) => i === index ? { ...step, ...updates } : step));
  };

  const removeWorkflowStep = (index: number) => {
    if (workflow.length > 1) {
      setWorkflow(workflow.filter((_, i) => i !== index));
    }
  };

  const toggleAgent = (agent: string) => {
    setRecommendedAgents(
      recommendedAgents.includes(agent)
        ? recommendedAgents.filter(a => a !== agent)
        : [...recommendedAgents, agent]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || workflow.some(s => !s.stepName.trim())) return;

    await updateTemplate(template.id, {
      name: name.trim(),
      description: description.trim(),
      category,
      workflow: workflow.filter(s => s.stepName.trim()),
      recommendedAgents,
    });
    onSuccess();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-dark-700">
        <h3 className="text-white font-mono font-semibold text-lg">编辑模板</h3>
        <p className="text-xs text-gray-500 font-mono mt-1">修改模板内容</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* 基本信息 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-500 mb-2">模板名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入模板名称..."
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 mb-2">描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="输入模板描述..."
              rows={2}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
              {(['content', 'analysis', 'monitoring', 'report', 'custom'] as TemplateCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-mono transition-colors',
                    category === cat
                      ? 'bg-accent-orange text-dark-900'
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  )}
                >
                  {CATEGORY_ICONS[cat]} {getCategoryName(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 工作流步骤 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-mono text-gray-500">工作流步骤 *</label>
            <button
              onClick={addWorkflowStep}
              className="text-xs font-mono text-accent-orange hover:text-accent-orange/80"
            >
              + 添加步骤
            </button>
          </div>
          <div className="space-y-2">
            {workflow.map((step, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-dark-800 rounded-lg border border-dark-600">
                <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs font-mono text-gray-400 shrink-0 mt-1">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={step.stepName}
                    onChange={e => updateWorkflowStep(index, { stepName: e.target.value })}
                    placeholder="步骤名称..."
                    className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-accent-orange"
                  />
                  <div className="flex gap-2">
                    <select
                      value={step.assignedRole}
                      onChange={e => updateWorkflowStep(index, { assignedRole: e.target.value })}
                      className="flex-1 bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-white text-sm font-mono"
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{getRoleName(role)}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={step.estimatedDuration}
                      onChange={e => updateWorkflowStep(index, { estimatedDuration: parseInt(e.target.value) || 0 })}
                      placeholder="分钟"
                      min={1}
                      className="w-20 bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-white text-sm font-mono"
                    />
                    <span className="text-xs text-gray-500 self-center">分钟</span>
                  </div>
                </div>
                {workflow.length > 1 && (
                  <button
                    onClick={() => removeWorkflowStep(index)}
                    className="p-1.5 rounded hover:bg-dark-700 transition-colors text-gray-500 hover:text-accent-red"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 推荐 Agent */}
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-3">推荐 Agent</label>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map(role => (
              <button
                key={role}
                onClick={() => toggleAgent(role)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-mono transition-colors',
                  recommendedAgents.includes(role)
                    ? 'bg-accent-orange text-dark-900'
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                )}
              >
                {getRoleName(role)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-dark-700 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-sm hover:bg-dark-600 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || workflow.some(s => !s.stepName.trim())}
          className={clsx(
            'flex-1 py-2 rounded-lg font-mono text-sm font-semibold transition-colors',
            name.trim() && !workflow.some(s => !s.stepName.trim())
              ? 'bg-accent-orange text-dark-900 hover:bg-accent-orange/90'
              : 'bg-dark-700 text-gray-500 cursor-not-allowed'
          )}
        >
          保存修改
        </button>
      </div>
    </div>
  );
}

export default TaskTemplates;