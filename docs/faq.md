# 常见问题 (FAQ)

本文档收集了 OpenClaw Agent Dashboard 的常见问题及解决方案。

## 安装相关

### Q: Node.js 版本要求是什么？

**A**: 需要 Node.js 18.0 或更高版本。推荐使用 LTS 版本。

```bash
# 检查当前版本
node --version

# 使用 nvm 安装/切换版本
nvm install 18
nvm use 18
```

### Q: npm install 失败怎么办？

**A**: 尝试以下步骤：

```bash
# 1. 清除 npm 缓存
npm cache clean --force

# 2. 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 3. 重新安装
npm install --legacy-peer-deps

# 如果仍然失败，尝试使用 yarn
yarn install
```

### Q: 在 Windows 上安装遇到问题？

**A**: 推荐使用 WSL2 (Windows Subsystem for Linux)：

```powershell
# 安装 WSL2
wsl --install

# 在 WSL2 中安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 配置相关

### Q: 如何找到 OpenClaw 的安装路径？

**A**:

```bash
# macOS/Linux
which openclaw

# 或查找命令路径
command -v openclaw

# 在 .env 中设置完整路径
OPENCLAW_COMMAND=/usr/local/bin/openclaw
```

### Q: .env 文件应该放在哪里？

**A**: `.env` 文件应放在项目根目录，与 `package.json` 同级。

```bash
openclaw-agent-dashboard/
├── .env           # 在这里
├── .env.example
├── package.json
└── ...
```

### Q: 如何更改默认端口？

**A**: 在 `.env` 文件中修改：

```bash
# 后端 API 端口
OPENCLAW_DASHBOARD_PORT=3002

# 前端端口在 vite.config.ts 中修改
```

### Q: 环境变量不生效？

**A**: 检查以下几点：

1. 确认 `.env` 文件在正确位置
2. 确认环境变量名称正确（区分大小写）
3. 重启服务使配置生效
4. 检查是否有系统环境变量覆盖

```bash
# 验证配置
cat .env

# 直接设置环境变量测试
OPENCLAW_DASHBOARD_PORT=3002 npm run dev:server
```

## Gateway 相关

### Q: Gateway 启动失败？

**A**:

```bash
# 检查端口是否被占用
lsof -i :18789

# 杀死占用端口的进程
kill -9 <PID>

# 重新启动 Gateway
openclaw gateway start

# 检查 Gateway 日志
openclaw gateway logs
```

### Q: Dashboard 无法连接 Gateway？

**A**:

1. 确认 Gateway 正在运行：
   ```bash
   openclaw gateway status
   curl http://127.0.0.1:18789/health
   ```

2. 检查 Gateway URL 配置：
   ```bash
   # .env 文件
   OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
   ```

3. 检查防火墙设置：
   ```bash
   # macOS
   sudo pfctl -s all

   # Linux
   sudo ufw status
   ```

### Q: 如何在远程服务器上使用 Gateway？

**A**:

1. 在服务器上启动 Gateway：
   ```bash
   openclaw gateway start --host 0.0.0.0
   ```

2. 在本地 `.env` 中配置：
   ```bash
   OPENCLAW_GATEWAY_URL=ws://your-server-ip:18789
   ```

3. 确保服务器防火墙开放 18789 端口

## Agent 相关

### Q: Agent 列表为空？

**A**:

1. 确认已创建 Agent：
   ```bash
   openclaw agents list
   ```

2. 检查工作空间路径：
   ```bash
   ls -la ~/.openclaw/workspace/
   ```

3. 运行自动检测脚本：
   ```bash
   node scripts/detect-openclaw.js --force
   ```

### Q: Agent 状态显示 offline？

**A**:

Agent 状态由 Gateway 维护。检查：

```bash
# 检查 Gateway 健康状态
curl http://127.0.0.1:18789/health

# 重启 Gateway
openclaw gateway restart

# 检查 Agent 心跳配置
cat ~/.openclaw/workspace/HEARTBEAT.md
```

### Q: 如何创建新的 Agent？

**A**:

```bash
# 使用 OpenClaw CLI 创建
openclaw agent create my-agent

# 或手动创建目录
mkdir -p ~/.openclaw/workspace/my-agent
cd ~/.openclaw/workspace/my-agent
touch SOUL.md AGENTS.md TOOLS.md
```

### Q: Agent 文件编辑后不生效？

**A**:

1. 确保点击了保存按钮
2. 检查文件权限
3. Agent 可能需要重新加载配置

```bash
# 验证文件内容
cat ~/.openclaw/workspace/agent-id/SOUL.md

# 检查文件权限
ls -la ~/.openclaw/workspace/agent-id/
```

## 功能使用

### Q: 聊天功能无法发送消息？

**A**:

1. 确认已选择 Agent
2. 检查网络连接
3. 查看 API 响应：

```javascript
// 打开浏览器开发者工具
// 查看 Network 面板中的 /api/agents/:id/send 请求
```

### Q: 代码编辑器显示异常？

**A**:

1. 清除浏览器缓存
2. 检查控制台错误
3. 尝试刷新页面

```bash
# 强制刷新浏览器
# Chrome: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

### Q: 如何查看更详细的服务日志？

**A**:

```bash
# 查看 Dashboard 后端日志
# 控制台输出

# 查看 OpenClaw 日志
tail -f /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log

# 查看 Gateway 日志
openclaw gateway logs --follow
```

### Q: 界面加载缓慢？

**A**:

1. 检查网络延迟
2. 减少日志历史加载量
3. 考虑增加超时设置：

```bash
# .env
OPENCLAW_TIMEOUT=120000
OPENCLAW_GATEWAY_REQUEST_TIMEOUT=60000
```

## 部署相关

### Q: 如何在生产环境部署？

**A**: 参考 [安装指南](./installation.md#生产环境部署) 的生产部署章节。

主要步骤：
1. 构建生产版本：`npm run build`
2. 使用 PM2 或 Docker 管理进程
3. 配置 Nginx 反向代理

### Q: Docker 部署注意事项？

**A**:

1. 确保 Gateway URL 正确：
   ```bash
   # 使用 host.docker.internal 访问宿主机
   OPENCLAW_GATEWAY_URL=ws://host.docker.internal:18789
   ```

2. 挂载工作空间：
   ```bash
   docker run -v ~/.openclaw:/root/.openclaw ...
   ```

### Q: 如何配置 HTTPS？

**A**:

1. 使用 Nginx 配置 SSL：
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:3001;
       }
   }
   ```

2. Gateway 使用 WSS：
   ```bash
   OPENCLAW_GATEWAY_URL=wss://gateway.example.com
   ```

## 错误排查

### Q: 出现 "Command failed" 错误？

**A**:

```bash
# 手动执行命令测试
openclaw agents list

# 检查命令路径
which openclaw

# 查看详细错误
openclaw agents list --verbose
```

### Q: 出现 WebSocket 错误？

**A**:

```bash
# 测试 WebSocket 连接
wscat -c ws://127.0.0.1:18789

# 或使用 curl
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" \
  http://127.0.0.1:18789
```

### Q: 出现权限错误？

**A**:

```bash
# 修复 OpenClaw 目录权限
chmod -R 755 ~/.openclaw

# 如果使用 sudo 安装，需要修复所有权
sudo chown -R $(whoami) ~/.openclaw
```

## 其他问题

### Q: 如何获取更多帮助？

**A**:

1. 查阅 [文档](./)
2. 搜索 [GitHub Issues](https://github.com/anthropics/openclaw-agent-dashboard/issues)
3. 提交新的 Issue（包含系统信息、错误日志、复现步骤）

### Q: 如何反馈 Bug 或建议功能？

**A**:

在 GitHub 创建 Issue：

```markdown
**Bug 描述**
清晰简洁地描述 bug。

**复现步骤**
1. 执行 '...'
2. 点击 '...'
3. 看到错误 '...'

**期望行为**
描述期望发生什么。

**环境信息**
- OS: [如 macOS 13.0]
- Node.js: [如 18.17.0]
- Dashboard 版本: [如 0.1.0]

**截图**
如果适用，添加截图帮助解释问题。
```

### Q: 如何参与项目贡献？

**A**: 参考 [贡献指南](../CONTRIBUTING.md)。