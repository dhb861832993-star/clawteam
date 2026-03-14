# 使用教程

本教程将指导你如何使用 OpenClaw Agent Dashboard 管理 AI Agent 团队。

## 界面概览

Dashboard 界面分为三个主要区域：

```
┌─────────────────────────────────────────────────────────────┐
│                         Header                               │
│  OpenClaw Dashboard                    🔔 ⚙️ 👤              │
├─────────────────────────────────────────────────────────────┤
│                    │                        │                │
│    Agent Grid      │     Right Panel        │                │
│                    │                        │                │
│  ┌─────┐ ┌─────┐   │  ┌──────────────────┐  │                │
│  │ 🦁  │ │ 🐻  │   │  │ Properties/Chat  │  │                │
│  │队长 │ │分析师│   │  │                  │  │                │
│  │     │ │     │   │  │                  │  │                │
│  └─────┘ └─────┘   │  └──────────────────┘  │                │
│                    │                        │                │
│  ┌─────┐ ┌─────┐   │  ┌──────────────────┐  │                │
│  │ 🐱  │ │ 🦊  │   │  │ File Editor      │  │                │
│  │设计师│ │工程师│   │  │                  │  │                │
│  │     │ │     │   │  │                  │  │                │
│  └─────┘ └─────┘   │  └──────────────────┘  │                │
│                    │                        │                │
└─────────────────────────────────────────────────────────────┘
```

## Agent 管理

### 查看 Agent 列表

启动 Dashboard 后，主界面会显示所有已配置的 Agent 卡片：

每个 Agent 卡片显示：
- **头像**: Agent 的动物标识（如 🦁、🐻、🐱）
- **名称**: Agent 显示名（队长、分析师、设计师等）
- **状态**: 当前运行状态
- **模型**: 使用的 AI 模型
- **负载**: 当前工作量（0-100%）

### Agent 状态说明

| 状态 | 颜色 | 说明 |
|------|------|------|
| **online** | 绿色 | Agent 在线，可以接收任务 |
| **working** | 蓝色 | Agent 正在处理任务 |
| **waiting** | 黄色 | Agent 等待输入或响应 |
| **offline** | 灰色 | Agent 离线 |
| **error** | 红色 | Agent 遇到错误 |

### 选择 Agent

点击 Agent 卡片可选中该 Agent，右侧面板会显示详细信息：

```typescript
// 状态管理示例
const { selectAgent, selectedAgentId } = useAppStore();

// 选择 Agent
selectAgent('agent-id');
```

## 文件编辑

Dashboard 内置代码编辑器，支持编辑 Agent 配置文件。

### 支持的文件类型

Agent 工作空间中的关键文件：

| 文件名 | 用途 |
|--------|------|
| **SOUL.md** | Agent 核心人格和使命定义 |
| **AGENTS.md** | Agent 团队协作规范 |
| **TOOLS.md** | Agent 可用工具列表 |
| **MEMORY.md** | Agent 记忆和经验存储 |
| **HEARTBEAT.md** | Agent 定期任务配置 |

### 编辑文件

1. 选择目标 Agent
2. 在右侧面板点击文件标签页
3. 编辑器会加载文件内容
4. 修改后点击 **保存** 按钮

```typescript
// 保存文件的 API 调用
const success = await saveAgentFile(agentId, 'SOUL.md', content);
```

### 代码编辑器功能

- **语法高亮**: Markdown 格式高亮
- **行号显示**: 便于定位
- **自动补全**: Markdown 语法提示
- **实时预览**: Markdown 渲染预览（计划中）

## 聊天交互

### 发送消息

与 Agent 进行对话：

1. 选择目标 Agent
2. 切换到 **Chat** 标签页
3. 在输入框输入消息
4. 按 Enter 或点击发送按钮

```typescript
// 发送消息示例
const { sendChatMessage, messages } = useAppStore();

await sendChatMessage('leader', '请分析当前项目进度');
```

### 消息类型

| 类型 | 图标 | 说明 |
|------|------|------|
| **text** | 无 | 普通文本消息 |
| **file** | 📄 | 文件分享 |
| **command** | ⚡ | 命令执行 |
| **notification** | 🔔 | 系统通知 |

### 消息历史

Dashboard 会缓存当前会话的消息历史，切换 Agent 后会清空。

## 任务管理

### 查看任务进度

任务进度显示在 Agent 卡片和详情面板中：

```
任务进度
├── 步骤 1: 需求分析 ✓
├── 步骤 2: 方案设计 ⏳
├── 步骤 3: 代码实现 ⏸
└── 步骤 4: 测试验收 ⏸
```

### 任务状态

| 状态 | 说明 |
|------|------|
| **pending** | 等待执行 |
| **running** | 正在执行 |
| **completed** | 已完成 |
| **failed** | 执行失败 |
| **blocked** | 被阻塞 |

## 日志查看

### 访问日志

切换到 **Logs** 标签页查看 Agent 活动日志：

```
[2024-01-15 10:30:15] INFO  [leader] Task started: analyze-codebase
[2024-01-15 10:30:18] DEBUG [leader] Reading SOUL.md
[2024-01-15 10:30:20] INFO  [leader] Agent initialized
[2024-01-15 10:31:45] WARN  [analyst] Rate limit approaching
[2024-01-15 10:32:00] ERROR [designer] API connection failed
```

### 日志级别

| 级别 | 颜色 | 用途 |
|------|------|------|
| **INFO** | 蓝色 | 一般信息 |
| **DEBUG** | 灰色 | 调试信息 |
| **WARN** | 黄色 | 警告信息 |
| **ERROR** | 红色 | 错误信息 |

### 日志过滤

可通过以下方式过滤日志：

```typescript
// 按来源过滤
logs.filter(log => log.source === 'agent');

// 按级别过滤
logs.filter(log => log.level === 'error');

// 按时间过滤
logs.filter(log => log.timestamp > startTime);
```

## 团队协作

### Agent 间通信

Agent 之间可以通过 Gateway 进行通信：

```bash
# 使用 CLI 发送消息
openclaw send --agent leader --message "@analyst 请分析数据"
```

### 工作流配置

在 `AGENTS.md` 中定义团队协作规则：

```markdown
# Team Workflow

## 协作规则

1. **需求阶段**: leader → analyst
2. **设计阶段**: analyst → designer
3. **开发阶段**: designer → engineer
4. **测试阶段**: engineer → tester

## 通信协议

- 使用 @mention 引用其他 Agent
- 任务完成后通知下一个负责人
- 遇到阻塞时升级到 leader
```

## 实时监控

### Gateway 状态

通过 API 检查 Gateway 健康状态：

```bash
curl http://localhost:3001/api/gateway/health
```

响应示例：

```json
{
  "ok": true,
  "agents": [
    {
      "agentId": "leader",
      "sessions": { "count": 5 }
    }
  ],
  "sessions": {
    "count": 15,
    "recent": [...]
  }
}
```

### 性能指标

Dashboard 监控的关键指标：

- **活跃会话数**: 当前处理中的对话数
- **Token 使用量**: 累计使用的 Token 数
- **响应时间**: Agent 平均响应时间
- **错误率**: 请求失败比例

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + K` | 快速搜索 Agent |
| `Ctrl/Cmd + S` | 保存当前文件 |
| `Ctrl/Cmd + Enter` | 发送消息 |
| `Escape` | 取消选择 |
| `?` | 显示帮助 |

## 最佳实践

### 1. Agent 配置

定期更新 Agent 的 `SOUL.md` 文件，优化其行为：

```markdown
# SOUL.md 更新建议

## 每周检查
- 回顾 Agent 表现
- 更新优先级设置
- 添加新的经验教训

## 优化方向
- 减少冗余确认
- 提高响应精确度
- 增强错误恢复能力
```

### 2. 团队协作

- 明确每个 Agent 的职责边界
- 建立清晰的通信协议
- 定期清理历史会话

### 3. 资源管理

- 监控 Token 使用量
- 及时清理不需要的会话
- 合理设置 Agent 负载上限