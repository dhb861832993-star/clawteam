# OpenClaw Agent Dashboard

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

**一个现代化的 Web 仪表盘，用于管理和监控 OpenClaw AI Agent 团队**

[English](#english) | [简体中文](#简体中文)

</div>

---

## 简体中文

### 功能特性

- **Agent 概览** - 一览所有 OpenClaw Agent 的状态和信息
- **实时监控** - 监控 Agent 健康状态和会话活动
- **文件管理** - 编辑 Agent 配置文件（SOUL.md、AGENTS.md 等）
- **聊天交互** - 向 Agent 发送消息并查看响应
- **日志查看** - 实时追踪 Agent 活动日志

![Dashboard 预览](docs/dashboard-preview.png)

### 快速开始

#### 前置要求

- **Node.js** 18+ 和 npm
- **OpenClaw CLI** 已安装并配置
- 运行中的 OpenClaw Gateway

#### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/dhb861832993-star/clawteam.git
cd clawteam

# 2. 安装依赖
npm install

# 3. 自动配置环境
node scripts/detect-openclaw.js

# 4. 启动 Gateway（如果未运行）
openclaw gateway start

# 5. 启动 Dashboard
npm run dev:all
```

打开浏览器访问 http://localhost:5173

### 项目结构

```
openclaw-agent-dashboard/
├── src/
│   ├── api/              # API 客户端
│   ├── components/       # React 组件
│   ├── config/           # 配置模块
│   ├── lib/              # OpenClaw 客户端
│   ├── stores/           # 状态管理
│   └── types/            # TypeScript 类型
├── server.ts             # Express API 服务器
├── scripts/              # 工具脚本
└── docs/                 # 文档
```

### 架构设计

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   浏览器        │────▶│   Dashboard     │────▶│   OpenClaw      │
│   (React)       │     │   Server        │     │   CLI/Gateway   │
│                 │     │   (Express)     │     │                 │
│   ws://gateway  │────▶│                 │────▶│   Agents        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **前端**: React 19 + Vite 8 + Tailwind CSS 3
- **后端**: Express 5 API 服务器
- **通信**: WebSocket 连接 Gateway，CLI 调用 OpenClaw

### 文档

| 文档 | 描述 |
|------|------|
| [安装指南](docs/installation.md) | 详细安装步骤、环境要求、故障排查 |
| [配置说明](docs/configuration.md) | 所有环境变量、配置项详解 |
| [使用教程](docs/usage.md) | Agent 管理、任务创建、团队协作 |
| [开发指南](docs/development.md) | 本地开发、代码规范、提交 PR |
| [常见问题](docs/faq.md) | Q&A 格式解答常见问题 |

### 开发命令

```bash
npm run dev          # 启动前端开发服务器 (端口 5173)
npm run dev:server   # 启动后端 API 服务器 (端口 3001)
npm run dev:all      # 同时启动前后端
npm run build        # 构建生产版本
npm run lint         # 运行 ESLint 检查
```

### 配置

所有配置通过环境变量设置：

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `OPENCLAW_DASHBOARD_PORT` | API 服务器端口 | `3001` |
| `OPENCLAW_DASHBOARD_HOST` | API 服务器主机 | `localhost` |
| `OPENCLAW_COMMAND` | OpenClaw 二进制路径 | `openclaw` |
| `OPENCLAW_GATEWAY_URL` | Gateway WebSocket URL | `ws://127.0.0.1:18789` |
| `OPENCLAW_LOG_PATH` | 日志文件路径 | `/tmp/openclaw` |
| `OPENCLAW_WORKSPACE_BASE` | 工作空间路径 | `~/.openclaw/workspace` |

详见 [配置说明](docs/configuration.md)。

### 贡献

欢迎贡献代码！请阅读 [贡献指南](CONTRIBUTING.md) 了解详情。

### 许可证

[MIT License](LICENSE)

### 相关项目

- [OpenClaw](https://github.com/openclaw/openclaw) - AI Agent 框架
- [Claude Code](https://github.com/anthropics/claude-code) - Claude CLI 工具
- [clawteam](https://github.com/dhb861832993-star/clawteam) - 本项目

---

## English

### Features

- **Agent Overview** - View all your OpenClaw agents at a glance
- **Real-time Status** - Monitor agent health and session activity
- **File Management** - Edit agent configuration files (SOUL.md, AGENTS.md, etc.)
- **Chat Interface** - Send messages to agents and view responses
- **Log Viewer** - Track agent activity in real-time

### Quick Start

```bash
# Clone and install
git clone https://github.com/anthropics/openclaw-agent-dashboard.git
cd openclaw-agent-dashboard
npm install

# Configure environment
node scripts/detect-openclaw.js

# Start Gateway
openclaw gateway start

# Start Dashboard
npm run dev:all
```

Visit http://localhost:5173

### Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](docs/installation.md) | Setup steps, requirements, troubleshooting |
| [Configuration](docs/configuration.md) | Environment variables and settings |
| [Usage Tutorial](docs/usage.md) | Agent management, tasks, collaboration |
| [Development Guide](docs/development.md) | Local development, code standards, PRs |
| [FAQ](docs/faq.md) | Common questions and answers |

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### License

[MIT License](LICENSE)

---

<div align="center">

Made with ❤️ by the OpenClaw Team

</div>