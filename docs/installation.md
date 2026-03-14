# 安装指南

本文档详细介绍 OpenClaw Agent Dashboard 的安装步骤、环境要求和故障排查方法。

## 环境要求

### 必需软件

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| **Node.js** | 18.0+ | 运行时环境 |
| **npm** | 9.0+ | 包管理器 |
| **OpenClaw CLI** | 最新版 | AI Agent 框架 |

### 可选软件

| 软件 | 用途 |
|------|------|
| **pnpm/yarn** | 替代 npm 的包管理器 |
| **Docker** | 容器化部署 |

### 系统支持

- **macOS**: 12.0 (Monterey) 及以上
- **Linux**: Ubuntu 20.04+, Debian 11+, CentOS 8+
- **Windows**: Windows 10/11 with WSL2

## 安装步骤

### 1. 安装 Node.js

**使用 nvm（推荐）**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node.js 18+
nvm install 18
nvm use 18

# 验证安装
node --version  # 应显示 v18.x.x 或更高
npm --version   # 应显示 9.x.x 或更高
```

**使用官方安装包**

访问 [Node.js 官网](https://nodejs.org/) 下载 LTS 版本安装包。

### 2. 安装 OpenClaw CLI

```bash
# 使用 npm 安装
npm install -g @anthropics/openclaw

# 或使用项目源码安装
git clone https://github.com/anthropics/openclaw.git
cd openclaw
npm install
npm run build
npm link
```

验证安装：

```bash
openclaw --version
openclaw --help
```

### 3. 克隆 Dashboard 项目

```bash
# 克隆仓库
git clone https://github.com/anthropics/openclaw-agent-dashboard.git
cd openclaw-agent-dashboard

# 安装依赖
npm install
```

### 4. 配置环境变量

**自动配置（推荐）**

```bash
node scripts/detect-openclaw.js
```

该脚本会自动检测：
- OpenClaw 二进制文件位置
- 日志文件目录
- 工作空间目录
- Gateway 运行状态

**手动配置**

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置文件
nano .env  # 或使用你喜欢的编辑器
```

### 5. 启动服务

**启动 OpenClaw Gateway**

Dashboard 需要连接到运行中的 Gateway：

```bash
# 启动 Gateway
openclaw gateway start

# 验证 Gateway 状态
openclaw gateway status

# 检查健康状态
curl http://127.0.0.1:18789/health
```

**启动 Dashboard**

```bash
# 同时启动前端和后端
npm run dev:all
```

或者分别启动：

```bash
# 终端 1: 启动后端 API 服务
npm run dev:server

# 终端 2: 启动前端开发服务器
npm run dev
```

### 6. 访问 Dashboard

打开浏览器访问：

- **前端界面**: http://localhost:5173
- **API 健康检查**: http://localhost:3001/api/health

## 生产环境部署

### 构建生产版本

```bash
# 构建前端静态文件
npm run build

# 生成的文件位于 dist/ 目录
```

### 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
pm2 start server.ts --name openclaw-dashboard

# 查看状态
pm2 status

# 查看日志
pm2 logs openclaw-dashboard
```

### 使用 Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

构建和运行：

```bash
docker build -t openclaw-dashboard .
docker run -p 3001:3001 --env-file .env openclaw-dashboard
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;

    location / {
        root /path/to/openclaw-agent-dashboard/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /ws {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 故障排查

### 常见问题

#### 1. OpenClaw 命令未找到

**症状**：
```
Error: Command failed: openclaw agents list
/bin/sh: openclaw: command not found
```

**解决方案**：

```bash
# 检查 OpenClaw 是否安装
which openclaw

# 如果未安装，执行安装
npm install -g @anthropics/openclaw

# 如果已安装但不在 PATH 中，在 .env 中设置完整路径
OPENCLAW_COMMAND=/usr/local/bin/openclaw
```

#### 2. Gateway 连接失败

**症状**：
```
Error: WebSocket error
[Gateway] Failed to connect
```

**解决方案**：

```bash
# 检查 Gateway 是否运行
openclaw gateway status

# 如果未运行，启动 Gateway
openclaw gateway start

# 检查端口是否被占用
lsof -i :18789

# 检查防火墙设置
```

#### 3. 端口被占用

**症状**：
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案**：

```bash
# 查找占用端口的进程
lsof -i :3001

# 终止进程
kill -9 <PID>

# 或更改端口（在 .env 中）
OPENCLAW_DASHBOARD_PORT=3002
```

#### 4. 权限被拒绝

**症状**：
```
Error: EACCES: permission denied, open '/path/to/file'
```

**解决方案**：

```bash
# 检查文件权限
ls -la ~/.openclaw/workspace/

# 修复权限
chmod -R 755 ~/.openclaw/

# 或使用 sudo（不推荐）
```

#### 5. Node 模块安装失败

**症状**：
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案**：

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install --legacy-peer-deps
```

### 获取帮助

如果以上方法无法解决问题：

1. 查看 [FAQ](./faq.md)
2. 搜索 [GitHub Issues](https://github.com/anthropics/openclaw-agent-dashboard/issues)
3. 提交新的 Issue，包含：
   - 操作系统版本
   - Node.js 版本
   - 完整错误日志
   - 复现步骤