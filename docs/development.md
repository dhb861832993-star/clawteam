# 开发指南

本文档面向希望参与 OpenClaw Agent Dashboard 开发的贡献者。

## 开发环境设置

### 系统要求

- **Node.js**: 18.0+ (推荐使用 LTS 版本)
- **npm**: 9.0+ 或 pnpm 8.0+
- **Git**: 2.30+
- **编辑器**: VS Code (推荐)

### 克隆项目

```bash
# Fork 项目到你的 GitHub 账户
# 然后克隆你的 fork
git clone https://github.com/YOUR_USERNAME/openclaw-agent-dashboard.git
cd openclaw-agent-dashboard

# 添加上游仓库
git remote add upstream https://github.com/anthropics/openclaw-agent-dashboard.git

# 安装依赖
npm install
```

### VS Code 配置

推荐安装以下扩展：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

项目根目录创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 项目结构

```
openclaw-agent-dashboard/
├── src/
│   ├── api/                 # API 客户端
│   │   ├── index.ts         # 导出入口
│   │   └── openclaw.ts      # Gateway WebSocket 客户端
│   │
│   ├── components/          # React 组件
│   │   ├── AgentCard.tsx    # Agent 卡片组件
│   │   ├── AgentGrid.tsx    # Agent 网格布局
│   │   ├── Header.tsx       # 顶部导航
│   │   ├── RightPanel.tsx   # 右侧面板
│   │   └── TaskProgress.tsx # 任务进度组件
│   │
│   ├── config/              # 配置模块
│   │   └── index.ts         # 环境变量配置
│   │
│   ├── lib/                 # 核心库
│   │   └── openclaw-client.ts # OpenClaw CLI 客户端
│   │
│   ├── stores/              # 状态管理
│   │   └── appStore.ts      # Zustand store
│   │
│   ├── types/               # TypeScript 类型
│   │   └── index.ts         # 类型定义
│   │
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
│
├── scripts/
│   └── detect-openclaw.js   # 自动配置脚本
│
├── server.ts                # Express API 服务器
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目配置
```

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.x | UI 框架 |
| **Vite** | 8.x | 构建工具 |
| **TypeScript** | 5.x | 类型安全 |
| **Tailwind CSS** | 3.x | 样式框架 |
| **Zustand** | 5.x | 状态管理 |
| **Monaco Editor** | 4.x | 代码编辑器 |
| **React Flow** | 12.x | 流程图组件 |
| **Lucide React** | 0.x | 图标库 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Express** | 5.x | API 服务器 |
| **CORS** | 2.x | 跨域支持 |

## 开发命令

```bash
# 启动开发服务器
npm run dev              # 仅前端 (端口 5173)
npm run dev:server       # 仅后端 (端口 3001)
npm run dev:all          # 同时启动前后端

# 构建生产版本
npm run build            # 构建前端
npm run preview          # 预览构建结果

# 代码质量
npm run lint             # 运行 ESLint
```

## 代码规范

### TypeScript 规范

```typescript
// ✅ 推荐：使用接口定义类型
interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
}

// ✅ 推荐：使用类型别名定义联合类型
type AgentStatus = 'online' | 'working' | 'offline';

// ❌ 避免：使用 any
const data: any = fetchData(); // 不推荐

// ✅ 推荐：使用泛型
const data: ApiResponse<Agent> = fetchData();
```

### React 组件规范

```tsx
// ✅ 推荐：使用函数组件和 Hooks
interface AgentCardProps {
  agent: Agent;
  onSelect: (id: string) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div className="agent-card" onClick={() => onSelect(agent.id)}>
      {/* ... */}
    </div>
  );
}

// ❌ 避免：类组件
class AgentCard extends React.Component { ... }
```

### 样式规范

使用 Tailwind CSS 类名：

```tsx
// ✅ 推荐：使用 clsx/tailwind-merge 组合类名
import { cn } from './utils';

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === 'primary' && "primary-variant"
)} />

// ❌ 避免：内联样式
<div style={{ padding: '10px' }} />
```

### 文件命名规范

```
components/
├── AgentCard.tsx      # 组件使用 PascalCase
├── AgentGrid.tsx
└── index.ts           # 导出文件

lib/
├── openclaw-client.ts # 工具函数使用 kebab-case
└── utils.ts

types/
└── index.ts           # 类型定义使用 index.ts
```

## API 开发

### 添加新 API 端点

在 `server.ts` 中添加新路由：

```typescript
// 获取 Agent 统计信息
app.get('/api/agents/stats', async (_req, res) => {
  try {
    const agents = await openclaw.listAgents();
    const stats = {
      total: agents.length,
      online: agents.filter(a => a.status === 'online').length,
      working: agents.filter(a => a.status === 'working').length,
    };
    res.json(stats);
  } catch (error) {
    console.error('[API] Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
```

### OpenClaw 客户端方法

在 `src/lib/openclaw-client.ts` 中添加新方法：

```typescript
/**
 * 获取 Agent 统计信息
 */
async getAgentStats(): Promise<AgentStats> {
  const agents = await this.listAgents();
  return {
    total: agents.length,
    online: agents.filter(a => a.status === 'online').length,
    // ...
  };
}
```

## 状态管理

### 使用 Zustand Store

```typescript
// 在 stores/appStore.ts 中添加新的状态
interface AppState {
  // 新增状态
  stats: AgentStats | null;
  loadStats: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初始值
  stats: null,

  // 异步加载
  loadStats: async () => {
    try {
      const response = await fetch('/api/agents/stats');
      const stats = await response.json();
      set({ stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },
}));
```

### 在组件中使用

```tsx
import { useAppStore } from '../stores/appStore';

function StatsPanel() {
  const { stats, loadStats } = useAppStore();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Online: {stats.online}</p>
    </div>
  );
}
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- --grep "AgentCard"

# 监视模式
npm test -- --watch
```

### 测试规范

```typescript
// AgentCard.test.tsx
import { render, screen } from '@testing-library/react';
import { AgentCard } from './AgentCard';

describe('AgentCard', () => {
  const mockAgent = {
    id: 'test-agent',
    name: 'Test Agent',
    status: 'online' as const,
  };

  it('renders agent name', () => {
    render(<AgentCard agent={mockAgent} onSelect={jest.fn()} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<AgentCard agent={mockAgent} onSelect={onSelect} />);
    screen.getByRole('button').click();
    expect(onSelect).toHaveBeenCalledWith('test-agent');
  });
});
```

## 提交代码

### Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**类型**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:

```bash
feat(editor): add markdown preview support

- Add live preview panel
- Support code syntax highlighting
- Fix scroll synchronization

Closes #123
```

### 提交前检查

```bash
# 确保代码通过 lint 检查
npm run lint

# 确保测试通过
npm test

# 确保构建成功
npm run build
```

## 发布流程

### 版本号规则

遵循 [SemVer](https://semver.org/) 语义化版本：

- **主版本号 (MAJOR)**: 不兼容的 API 更改
- **次版本号 (MINOR)**: 向后兼容的功能新增
- **修订号 (PATCH)**: 向后兼容的问题修复

### 发布步骤

1. 更新 `package.json` 版本号
2. 更新 `CHANGELOG.md`
3. 创建 Git tag
4. 构建 GitHub Release
5. 发布到 npm

## 调试技巧

### 前端调试

```typescript
// 在组件中添加调试日志
useEffect(() => {
  console.log('[AgentCard] Agent changed:', agent);
}, [agent]);

// 使用 React DevTools
// 安装: https://react.dev/learn/react-developer-tools
```

### 后端调试

```typescript
// 在 server.ts 中添加详细日志
app.get('/api/agents', async (_req, res) => {
  console.log('[API] GET /api/agents - Start');
  try {
    const agents = await openclaw.listAgents();
    console.log('[API] GET /api/agents - Success:', agents.length);
    res.json(agents);
  } catch (error) {
    console.error('[API] GET /api/agents - Error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});
```

### 网络请求调试

在浏览器开发者工具中：
1. 打开 Network 面板
2. 筛选 `api` 请求
3. 查看请求/响应详情

## 常见问题

### 热更新不生效

```bash
# 清除缓存重启
rm -rf node_modules/.vite
npm run dev
```

### 类型检查错误

```bash
# 重新生成类型
npm run build
```

### 内存泄漏

使用 React DevTools 的 Profiler 检测：
1. 打开 Profiler 面板
2. 录制操作
3. 分析组件渲染次数