# 配置说明

本文档详细说明 OpenClaw Agent Dashboard 的所有配置项及其使用方法。

## 配置方式

Dashboard 支持两种配置方式：

1. **环境变量** - 推荐用于生产环境
2. **.env 文件** - 推荐用于开发环境

## 配置文件

### .env 文件结构

项目根目录下的 `.env` 文件包含所有配置项：

```bash
# 从示例文件创建
cp .env.example .env
```

## 配置项详解

### 服务器配置

#### OPENCLAW_DASHBOARD_PORT

- **类型**: Number
- **默认值**: `3001`
- **描述**: Dashboard API 服务器监听端口
- **示例**:
  ```bash
  OPENCLAW_DASHBOARD_PORT=3001
  ```

#### OPENCLAW_DASHBOARD_HOST

- **类型**: String
- **默认值**: `localhost`
- **描述**: API 服务器绑定主机
- **生产环境建议**: `0.0.0.0` 允许外部访问
- **示例**:
  ```bash
  # 开发环境
  OPENCLAW_DASHBOARD_HOST=localhost

  # 生产环境
  OPENCLAW_DASHBOARD_HOST=0.0.0.0
  ```

### OpenClaw CLI 配置

#### OPENCLAW_COMMAND

- **类型**: String
- **默认值**: `openclaw`
- **描述**: OpenClaw CLI 命令或二进制文件路径
- **示例**:
  ```bash
  # 使用 PATH 中的命令
  OPENCLAW_COMMAND=openclaw

  # 使用完整路径
  OPENCLAW_COMMAND=/usr/local/bin/openclaw

  # 开发模式
  OPENCLAW_COMMAND=node /path/to/openclaw/dist/cli.js
  ```

#### OPENCLAW_TIMEOUT

- **类型**: Number (毫秒)
- **默认值**: `60000` (60秒)
- **描述**: CLI 命令执行超时时间
- **建议范围**: 1000 - 300000
- **示例**:
  ```bash
  OPENCLAW_TIMEOUT=60000
  ```

#### OPENCLAW_LOG_PATH

- **类型**: String (路径)
- **默认值**: `/tmp/openclaw`
- **描述**: OpenClaw 日志文件目录
- **示例**:
  ```bash
  OPENCLAW_LOG_PATH=/var/log/openclaw
  # 或
  OPENCLAW_LOG_PATH=~/.openclaw/logs
  ```

#### OPENCLAW_WORKSPACE_BASE

- **类型**: String (路径)
- **默认值**: `~/.openclaw/workspace`
- **描述**: Agent 工作空间基础路径
- **示例**:
  ```bash
  OPENCLAW_WORKSPACE_BASE=/data/openclaw/workspaces
  ```

### Gateway WebSocket 配置

#### OPENCLAW_GATEWAY_URL

- **类型**: String (URL)
- **默认值**: `ws://127.0.0.1:18789`
- **描述**: OpenClaw Gateway WebSocket 地址
- **示例**:
  ```bash
  # 本地开发
  OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789

  # 远程服务器
  OPENCLAW_GATEWAY_URL=ws://gateway.example.com:18789

  # 安全连接
  OPENCLAW_GATEWAY_URL=wss://gateway.example.com
  ```

#### OPENCLAW_GATEWAY_RECONNECT_INTERVAL

- **类型**: Number (毫秒)
- **默认值**: `5000` (5秒)
- **描述**: Gateway 连接断开后重连间隔
- **示例**:
  ```bash
  OPENCLAW_GATEWAY_RECONNECT_INTERVAL=5000
  ```

#### OPENCLAW_GATEWAY_REQUEST_TIMEOUT

- **类型**: Number (毫秒)
- **默认值**: `30000` (30秒)
- **描述**: Gateway RPC 请求超时时间
- **示例**:
  ```bash
  OPENCLAW_GATEWAY_REQUEST_TIMEOUT=30000
  ```

### 前端 API 配置

#### OPENCLAW_API_BASE

- **类型**: String (路径)
- **默认值**: `/api`
- **描述**: API 端点基础路径
- **示例**:
  ```bash
  OPENCLAW_API_BASE=/api
  # 使用反向代理时
  OPENCLAW_API_BASE=/openclaw/api
  ```

## 完整配置示例

### 开发环境

```bash
# .env - 开发环境配置

# Server
OPENCLAW_DASHBOARD_PORT=3001
OPENCLAW_DASHBOARD_HOST=localhost

# OpenClaw CLI
OPENCLAW_COMMAND=openclaw
OPENCLAW_TIMEOUT=60000
OPENCLAW_LOG_PATH=/tmp/openclaw
OPENCLAW_WORKSPACE_BASE=~/.openclaw/workspace

# Gateway
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_GATEWAY_RECONNECT_INTERVAL=5000
OPENCLAW_GATEWAY_REQUEST_TIMEOUT=30000

# API
OPENCLAW_API_BASE=/api
```

### 生产环境

```bash
# .env - 生产环境配置

# Server
OPENCLAW_DASHBOARD_PORT=3001
OPENCLAW_DASHBOARD_HOST=0.0.0.0

# OpenClaw CLI
OPENCLAW_COMMAND=/usr/local/bin/openclaw
OPENCLAW_TIMEOUT=120000
OPENCLAW_LOG_PATH=/var/log/openclaw
OPENCLAW_WORKSPACE_BASE=/data/openclaw/workspaces

# Gateway
OPENCLAW_GATEWAY_URL=ws://gateway.internal:18789
OPENCLAW_GATEWAY_RECONNECT_INTERVAL=3000
OPENCLAW_GATEWAY_REQUEST_TIMEOUT=60000

# API
OPENCLAW_API_BASE=/api
```

## 配置验证

Dashboard 启动时会自动验证配置。如果配置无效，会在控制台显示错误信息：

```bash
[Dashboard] Configuration loaded
[Dashboard] Server: http://localhost:3001
[Dashboard] OpenClaw command: openclaw
[Dashboard] Gateway: ws://127.0.0.1:18789
```

**验证失败示例**:

```
Invalid configuration:
  - Invalid server port: 70000
  - Invalid gateway URL: http://invalid (must start with ws:// or wss://)
  - OpenClaw timeout too short: 100ms (minimum 1000ms)
```

## 环境变量优先级

配置加载优先级（从高到低）：

1. 系统环境变量
2. `.env` 文件
3. 默认值

这意味着你可以通过设置系统环境变量来覆盖 `.env` 文件中的配置：

```bash
# 临时覆盖
OPENCLAW_DASHBOARD_PORT=3002 npm run dev:server

# 或导出环境变量
export OPENCLAW_DASHBOARD_PORT=3002
npm run dev:server
```

## 敏感信息处理

对于敏感配置（如 API 密钥），建议：

1. **不要**将 `.env` 文件提交到 Git
2. 使用系统环境变量或密钥管理服务
3. 使用 `.env.local` 存储本地敏感配置（已在 .gitignore 中）

```bash
# .env.local - 本地敏感配置（不提交到 Git）
ANTHROPIC_API_KEY=sk-ant-xxx
```

## Docker 环境配置

使用 Docker 时，通过 `-e` 参数传递环境变量：

```bash
docker run -d \
  -p 3001:3001 \
  -e OPENCLAW_DASHBOARD_PORT=3001 \
  -e OPENCLAW_GATEWAY_URL=ws://host.docker.internal:18789 \
  -e OPENCLAW_COMMAND=openclaw \
  openclaw-dashboard
```

或使用 `--env-file`：

```bash
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  openclaw-dashboard
```

## 配置调试

查看当前加载的配置：

```bash
# 通过 API 查看
curl http://localhost:3001/api/health

# 响应示例
{
  "status": "ok",
  "version": "0.1.0",
  "config": {
    "gateway": "ws://127.0.0.1:18789",
    "openclaw": "openclaw"
  }
}
```