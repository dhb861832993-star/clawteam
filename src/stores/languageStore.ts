import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'zh';

export interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// 翻译字典
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.title': 'AGENT MANAGEMENT',
    'header.subtitle': 'SYSTEM MONITORING INTERFACE // V10',
    'header.teams': 'Teams',
    'header.skills': 'Skills',
    'header.settings': 'Settings',
    'header.system_online': 'SYSTEM ONLINE',
    
    // Agent Grid
    'agent.network': 'AGENT NETWORK',
    'agent.online': 'Online',
    'agent.working': 'Working',
    'agent.waiting': 'Waiting',
    'agent.offline': 'Offline',
    
    // Task Progress
    'task.progress': 'TASK PROGRESS',
    'task.input': '✨ Enter task to auto-create team...',
    'task.send': 'Send',
    
    // Quick Actions
    'quick.actions': '🚀 Quick Actions',
    'quick.skills': 'Skills',
    'quick.communication': 'Communication',
    'quick.settings': 'Settings',
    'quick.teams': 'Teams',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.language.en': 'English',
    'settings.language.zh': '中文',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    
    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'create': 'Create',
  },
  zh: {
    // Header
    'header.title': 'AGENT 管理系统',
    'header.subtitle': '系统监控界面 // V10',
    'header.teams': '团队',
    'header.skills': '技能',
    'header.settings': '设置',
    'header.system_online': '系统在线',
    
    // Agent Grid
    'agent.network': 'AGENT 网络',
    'agent.online': '在线',
    'agent.working': '工作中',
    'agent.waiting': '等待中',
    'agent.offline': '离线',
    
    // Task Progress
    'task.progress': '任务进度',
    'task.input': '✨ 输入任务自动创建团队...',
    'task.send': '发送',
    
    // Quick Actions
    'quick.actions': '🚀 快捷操作',
    'quick.skills': '技能',
    'quick.communication': '通信',
    'quick.settings': '设置',
    'quick.teams': '团队',
    
    // Settings
    'settings.title': '设置',
    'settings.language': '语言',
    'settings.language.en': 'English',
    'settings.language.zh': '中文',
    'settings.theme': '主题',
    'settings.theme.dark': '深色',
    'settings.theme.light': '浅色',
    
    // Common
    'save': '保存',
    'cancel': '取消',
    'delete': '删除',
    'edit': '编辑',
    'create': '创建',
  },
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      
      setLanguage: (lang: Language) => {
        set({ language: lang });
      },
      
      t: (key: string) => {
        const { language } = get();
        return translations[language][key] || key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
