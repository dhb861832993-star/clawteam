import { create } from 'zustand';
import type { TaskTemplate, TemplateCategory, CreateTemplateInput, UpdateTemplateInput } from '../types/template';
import { toast } from './toastStore';

interface TemplateState {
  templates: TaskTemplate[];
  isLoading: boolean;
  error: string | null;
  selectedTemplateId: string | null;

  // Actions
  loadTemplates: () => Promise<void>;
  createTemplate: (input: CreateTemplateInput) => Promise<void>;
  updateTemplate: (id: string, updates: UpdateTemplateInput) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<void>;
  applyTemplate: (id: string) => TaskTemplate | null;
  selectTemplate: (id: string | null) => void;
  incrementUsage: (id: string) => void;
  getTemplatesByCategory: (category: TemplateCategory) => TaskTemplate[];
}

// 预设模板数据
const presetTemplates: TaskTemplate[] = [
  {
    id: 'template-competitor-analysis',
    name: '竞品分析',
    description: '全面分析竞争对手的产品、策略、优势和劣势，生成竞品分析报告',
    category: 'analysis',
    workflow: [
      { stepName: '竞品信息收集', assignedRole: 'analyst', estimatedDuration: 30 },
      { stepName: '功能对比分析', assignedRole: 'analyst', estimatedDuration: 45 },
      { stepName: '市场定位分析', assignedRole: 'analyst', estimatedDuration: 30 },
      { stepName: '撰写分析报告', assignedRole: 'writer', estimatedDuration: 60 },
    ],
    recommendedAgents: ['analyst', 'writer'],
    usageCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 30),
    isPreset: true,
  },
  {
    id: 'template-content-creation',
    name: '内容创作',
    description: '从选题、调研到创作的完整内容生产流程，适用于文章、博客等长内容',
    category: 'content',
    workflow: [
      { stepName: '选题调研', assignedRole: 'analyst', estimatedDuration: 20 },
      { stepName: '素材收集整理', assignedRole: 'analyst', estimatedDuration: 30 },
      { stepName: '内容框架设计', assignedRole: 'designer', estimatedDuration: 15 },
      { stepName: '正文撰写', assignedRole: 'writer', estimatedDuration: 90 },
      { stepName: '配图设计', assignedRole: 'designer', estimatedDuration: 30 },
    ],
    recommendedAgents: ['analyst', 'designer', 'writer'],
    usageCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 25),
    updatedAt: new Date(Date.now() - 86400000 * 25),
    isPreset: true,
  },
  {
    id: 'template-trending-monitor',
    name: '热点监控',
    description: '实时监控社交媒体热点话题，快速生成热点分析简报',
    category: 'monitoring',
    workflow: [
      { stepName: '热点数据采集', assignedRole: 'analyst', estimatedDuration: 15 },
      { stepName: '舆情分析', assignedRole: 'analyst', estimatedDuration: 20 },
      { stepName: '传播路径追踪', assignedRole: 'analyst', estimatedDuration: 15 },
      { stepName: '简报生成推送', assignedRole: 'operator', estimatedDuration: 10 },
    ],
    recommendedAgents: ['analyst', 'operator'],
    usageCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 20),
    updatedAt: new Date(Date.now() - 86400000 * 20),
    isPreset: true,
  },
  {
    id: 'template-data-report',
    name: '数据报告',
    description: '自动化数据采集、分析和报告生成流程，支持多数据源整合',
    category: 'report',
    workflow: [
      { stepName: '数据源配置', assignedRole: 'analyst', estimatedDuration: 15 },
      { stepName: '数据采集清洗', assignedRole: 'analyst', estimatedDuration: 30 },
      { stepName: '数据分析计算', assignedRole: 'analyst', estimatedDuration: 45 },
      { stepName: '可视化图表生成', assignedRole: 'analyst', estimatedDuration: 20 },
      { stepName: '报告撰写', assignedRole: 'writer', estimatedDuration: 40 },
    ],
    recommendedAgents: ['analyst', 'writer'],
    usageCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 15),
    updatedAt: new Date(Date.now() - 86400000 * 15),
    isPreset: true,
  },
  {
    id: 'template-customer-service',
    name: '客服响应',
    description: '智能客服响应流程，自动分类问题并生成回复建议',
    category: 'custom',
    workflow: [
      { stepName: '问题分类识别', assignedRole: 'support', estimatedDuration: 5 },
      { stepName: '知识库检索', assignedRole: 'support', estimatedDuration: 10 },
      { stepName: '回复方案生成', assignedRole: 'support', estimatedDuration: 15 },
      { stepName: '满意度跟踪', assignedRole: 'support', estimatedDuration: 10 },
    ],
    recommendedAgents: ['support'],
    usageCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 10),
    isPreset: true,
  },
];

// 角色映射（用于显示中文名）
const roleNames: Record<string, string> = {
  leader: '队长',
  analyst: '分析师',
  designer: '设计师',
  writer: '写手',
  operator: '运营',
  support: '客服',
  developer: '开发者',
  tester: '测试员',
};

export const getRoleName = (role: string): string => roleNames[role] || role;

// 分类名称映射
const categoryNames: Record<TemplateCategory, string> = {
  content: '内容创作',
  analysis: '分析研究',
  monitoring: '监控追踪',
  report: '数据报告',
  custom: '自定义',
};

export const getCategoryName = (category: TemplateCategory): string => categoryNames[category];

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,
  selectedTemplateId: null,

  // 加载模板
  loadTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // 模拟从存储加载，实际项目中可能从 API 加载
      const savedTemplates = localStorage.getItem('task-templates');
      let templates: TaskTemplate[];

      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        // 恢复日期对象
        templates = parsed.map((t: TaskTemplate) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        // 合并预设模板（确保预设模板始终存在）
        presetTemplates.forEach(preset => {
          if (!templates.find(t => t.id === preset.id)) {
            templates.push(preset);
          }
        });
      } else {
        templates = [...presetTemplates];
      }

      set({ templates, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load templates';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
    }
  },

  // 创建模板
  createTemplate: async (input: CreateTemplateInput) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newTemplate: TaskTemplate = {
        id: `template-${Date.now()}`,
        ...input,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPreset: false,
      };
      set(state => {
        const templates = [...state.templates, newTemplate];
        localStorage.setItem('task-templates', JSON.stringify(templates));
        return { templates };
      });
      toast.success(`模板 "${input.name}" 创建成功`);
    } catch (error) {
      toast.error('创建模板失败');
    }
  },

  // 更新模板
  updateTemplate: async (id: string, updates: UpdateTemplateInput) => {
    const template = get().templates.find(t => t.id === id);
    if (!template) return;

    if (template.isPreset) {
      toast.error('预设模板不可修改');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set(state => {
        const templates = state.templates.map(t =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        );
        localStorage.setItem('task-templates', JSON.stringify(templates));
        return { templates };
      });
      toast.success('模板更新成功');
    } catch (error) {
      toast.error('更新模板失败');
    }
  },

  // 删除模板
  deleteTemplate: async (id: string) => {
    const template = get().templates.find(t => t.id === id);
    if (!template) return;

    if (template.isPreset) {
      toast.error('预设模板不可删除');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set(state => {
        const templates = state.templates.filter(t => t.id !== id);
        localStorage.setItem('task-templates', JSON.stringify(templates));
        return { templates, selectedTemplateId: state.selectedTemplateId === id ? null : state.selectedTemplateId };
      });
      toast.success(`模板 "${template.name}" 已删除`);
    } catch (error) {
      toast.error('删除模板失败');
    }
  },

  // 复制模板
  duplicateTemplate: async (id: string) => {
    const template = get().templates.find(t => t.id === id);
    if (!template) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newTemplate: TaskTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        name: `${template.name} (副本)`,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPreset: false,
      };
      set(state => {
        const templates = [...state.templates, newTemplate];
        localStorage.setItem('task-templates', JSON.stringify(templates));
        return { templates };
      });
      toast.success(`模板 "${template.name}" 已复制`);
    } catch (error) {
      toast.error('复制模板失败');
    }
  },

  // 应用模板（返回模板数据，供调用方创建任务）
  applyTemplate: (id: string) => {
    const template = get().templates.find(t => t.id === id);
    if (!template) return null;

    // 增加使用次数
    get().incrementUsage(id);

    return template;
  },

  // 选择模板
  selectTemplate: (id: string | null) => {
    set({ selectedTemplateId: id });
  },

  // 增加使用次数
  incrementUsage: (id: string) => {
    set(state => {
      const templates = state.templates.map(t =>
        t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
      );
      localStorage.setItem('task-templates', JSON.stringify(templates));
      return { templates };
    });
  },

  // 按分类获取模板
  getTemplatesByCategory: (category: TemplateCategory) => {
    return get().templates.filter(t => t.category === category);
  },
}));