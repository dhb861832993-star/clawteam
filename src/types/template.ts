// ============= Phase 2: Task Templates =============

// 模板分类
export type TemplateCategory = 'content' | 'analysis' | 'monitoring' | 'report' | 'custom';

// 工作流步骤
export interface TemplateWorkflowStep {
  stepName: string;
  assignedRole: string;
  estimatedDuration: number; // minutes
}

// 任务模板
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  workflow: TemplateWorkflowStep[];
  recommendedAgents: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPreset: boolean; // 预设模板不可删除
}

// 模板创建输入
export interface CreateTemplateInput {
  name: string;
  description: string;
  category: TemplateCategory;
  workflow: TemplateWorkflowStep[];
  recommendedAgents: string[];
}

// 模板更新输入
export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  workflow?: TemplateWorkflowStep[];
  recommendedAgents?: string[];
}