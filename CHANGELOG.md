# 变更日志

本项目的所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.0.0] - 2026-03-15

### ✨ 新增 - Phase 1 MVP 完成

**核心功能**
- **Agent 网格展示** - 6 个 Agent 卡片（🐻🦁🐱🦉🦜🐜 动物头像）
- **任务流可视化** - 进度条 + 状态指示器（60% 进度）
- **右侧三模式面板**
  - 💬 对话模式 - 与 Agent 实时聊天（发送 + 接收）
  - ⚙️ 属性模式 - 查看/编辑 MD 配置文件（SOUL.md、AGENTS.md 等）
  - 📋 日志模式 - 实时系统日志 + 筛选
- **Monaco MD 文件编辑器** - 代码高亮 + 行号 + 保存功能
- **OpenClawClient 封装** - 统一的 API 客户端（sendMessage/readFile/writeFile）
- **Zustand 状态管理** - 轻量级状态管理 + 轮询同步
- **配置化架构** - 支持环境变量配置，可开源给别人使用
- **自动检测脚本** - `scripts/detect-openclaw.js` 一键生成配置

**UI 设计**
- UI v10 定稿（废土科幻风格）
- 动物头像设计（🦁队长 🐻大熊 🐱设计师 🦉分析师 🦜写手 🐜操作员）
- 响应式布局
- 深色主题 + 橙色强调色

**文档体系**（8 个文件，50+ KB）
- README.md（中英双语）
- docs/installation.md - 详细安装指南
- docs/configuration.md - 配置说明
- docs/usage.md - 使用教程
- docs/development.md - 开发指南
- docs/faq.md - 常见问题
- CONTRIBUTING.md - 贡献指南

### 🐛 修复
- 修复 OpenClaw API 调用错误（`gateway call agent.send` → `agent --agent --message`）
- 修复消息发送 500 错误
- 改进错误处理和日志输出（使用 spawn 替代 exec）
- 添加 Gateway Token 支持

### 👥 贡献者
- 👤 多来 A 梦（需求方）
- 🐻 大熊（main agent/协调）
- 🎨 设计师（UI 设计，v10 定稿）
- 📊 分析师（PRD 文档）
- 💻 Claude Code（代码实现 + 推送）

### 📦 技术栈
- 前端：React 19 + Vite 8 + TypeScript 5
- UI：Tailwind CSS 3 + shadcn/ui
- 状态管理：Zustand 5
- 代码编辑：Monaco Editor 4
- 后端：Express 5 + tsx
- 实时通信：WebSocket

[1.0.0]: https://github.com/dhb861832993-star/clawteam/releases/tag/v1.0.0

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