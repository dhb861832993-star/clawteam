# 变更日志

本项目的所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增

- 完善开源文档体系
- 添加自动配置检测脚本

## [0.1.0] - 2024-01-15

### 新增

- **核心功能**
  - Agent 概览面板，显示所有 Agent 状态
  - 实时状态监控（online/working/waiting/offline/error）
  - Agent 卡片网格布局

- **文件管理**
  - 内置 Monaco 代码编辑器
  - 支持编辑 SOUL.md、AGENTS.md、TOOLS.md 等配置文件
  - 文件标签页切换
  - 实时保存功能

- **聊天交互**
  - 与 Agent 进行对话
  - 消息历史记录
  - 消息类型区分（文本/文件/命令/通知）

- **日志查看**
  - 实时日志流
  - 日志级别过滤
  - 来源筛选

- **API 服务**
  - Express 后端服务器
  - RESTful API 端点
  - Gateway WebSocket 连接
  - OpenClaw CLI 集成

- **配置系统**
  - 环境变量配置
  - 自动检测脚本
  - 配置验证

### 技术栈

- 前端：React 19 + Vite 8 + Tailwind CSS 3
- 后端：Express 5
- 状态管理：Zustand 5
- 代码编辑：Monaco Editor 4
- 类型安全：TypeScript 5

---

## 版本规划

### [0.2.0] - 计划中

- [ ] Markdown 实时预览
- [ ] 多语言支持（i18n）
- [ ] 深色模式
- [ ] Agent 性能图表
- [ ] 批量操作支持

### [0.3.0] - 计划中

- [ ] 任务流程图可视化
- [ ] Agent 通信拓扑图
- [ ] 自定义 Agent 模板
- [ ] 导入/导出配置

### [1.0.0] - 未来

- [ ] 插件系统
- [ ] API 文档（OpenAPI）
- [ ] 性能监控仪表盘
- [ ] 团队协作功能

---

## 版本说明

### 版本号格式：MAJOR.MINOR.PATCH

- **MAJOR**: 不兼容的 API 更改
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修复

### 变更类型

- **新增 (Added)**: 新功能
- **变更 (Changed)**: 现有功能的变更
- **弃用 (Deprecated)**: 即将移除的功能
- **移除 (Removed)**: 已移除的功能
- **修复 (Fixed)**: Bug 修复
- **安全 (Security)**: 安全相关修复