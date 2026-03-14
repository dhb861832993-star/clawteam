# 贡献指南

感谢你考虑为 OpenClaw Agent Dashboard 做出贡献！

## 行为准则

本项目采用贡献者公约作为行为准则。参与此项目即表示你同意遵守其条款。请阅读 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) 了解详情。

## 如何贡献

### 报告 Bug

如果你发现了 bug，请创建一个 Issue：

1. 使用清晰的标题描述问题
2. 描述复现步骤
3. 说明期望行为和实际行为
4. 附上系统信息和日志

**Bug 报告模板**：

```markdown
**Bug 描述**
[清晰简洁地描述 bug]

**复现步骤**
1. 执行 '...'
2. 点击 '...'
3. 看到错误 '...'

**期望行为**
[描述期望发生什么]

**实际行为**
[描述实际发生了什么]

**环境信息**
- OS: [如 macOS 13.0]
- Node.js: [如 18.17.0]
- Dashboard 版本: [如 0.1.0]

**截图**
[如果适用，添加截图]

**日志**
[粘贴相关日志]
```

### 建议新功能

欢迎提出新功能建议！

1. 创建一个 Issue，使用 `enhancement` 标签
2. 清晰描述功能和用例
3. 说明为什么这个功能对项目有价值

**功能建议模板**：

```markdown
**功能描述**
[清晰描述你希望的功能]

**用例场景**
[描述这个功能解决什么问题]

**建议实现**
[可选：描述你建议的实现方式]

**替代方案**
[可选：描述你考虑过的替代方案]
```

### 提交代码

#### 开发流程

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 fork 项目
   # 然后克隆你的 fork
   git clone https://github.com/YOUR_USERNAME/openclaw-agent-dashboard.git
   cd openclaw-agent-dashboard
   ```

2. **创建分支**
   ```bash
   # 从 main 创建功能分支
   git checkout -b feature/your-feature-name

   # 或修复分支
   git checkout -b fix/your-fix-name
   ```

3. **进行开发**
   ```bash
   # 安装依赖
   npm install

   # 启动开发服务器
   npm run dev:all
   ```

4. **确保代码质量**
   ```bash
   # 运行 lint 检查
   npm run lint

   # 确保构建成功
   npm run build
   ```

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

6. **推送并创建 PR**
   ```bash
   git push origin feature/your-feature-name
   # 在 GitHub 上创建 Pull Request
   ```

#### 分支命名规范

- `feature/` - 新功能（如 `feature/chat-export`）
- `fix/` - Bug 修复（如 `fix/websocket-reconnect`）
- `docs/` - 文档更新（如 `docs/api-reference`）
- `refactor/` - 代码重构（如 `refactor/state-management`）
- `test/` - 测试相关（如 `test/agent-card`）

#### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**类型**：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**：

```bash
feat(editor): add markdown preview panel

- Add live preview using marked library
- Support code syntax highlighting
- Sync scroll between editor and preview

Closes #123
```

#### Pull Request 规范

PR 标题应遵循与提交信息相同的格式。

**PR 描述模板**：

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 其他

## 描述
[清晰描述此 PR 的变更]

## 相关 Issue
[如 Closes #123]

## 测试
[描述如何测试这些变更]

## 截图
[如果适用，添加截图]

## 检查清单
- [ ] 代码通过 lint 检查
- [ ] 构建成功
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
```

### 代码规范

#### TypeScript

- 使用 TypeScript 编写所有代码
- 为函数添加类型注解
- 避免使用 `any`，使用 `unknown` 或具体类型
- 使用接口定义对象类型

```typescript
// ✅ 推荐
interface Agent {
  id: string;
  name: string;
}

function getAgent(id: string): Agent | null { ... }

// ❌ 避免
function getAgent(id: any): any { ... }
```

#### React

- 使用函数组件和 Hooks
- 组件使用 PascalCase 命名
- Props 使用接口定义
- 使用 `useState` 和 `useEffect` 进行状态管理

```tsx
// ✅ 推荐
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

#### 样式

- 使用 Tailwind CSS 类名
- 使用 `cn()` 函数组合类名
- 避免内联样式

```tsx
// ✅ 推荐
import { cn } from '../utils';

<div className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500"
)} />
```

#### 文件组织

```
components/
├── ComponentName.tsx    # 组件实现
├── ComponentName.test.tsx  # 组件测试（如果有）
└── index.ts             # 导出
```

### 文档贡献

文档位于 `docs/` 目录：

- `installation.md` - 安装指南
- `configuration.md` - 配置说明
- `usage.md` - 使用教程
- `development.md` - 开发指南
- `faq.md` - 常见问题

文档改进同样欢迎！

### 测试贡献

添加测试用例帮助提高代码质量：

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 开发设置

详见 [开发指南](docs/development.md)。

## 获取帮助

- 查看 [FAQ](docs/faq.md)
- 搜索 [Issues](https://github.com/anthropics/openclaw-agent-dashboard/issues)
- 在 [Discussions](https://github.com/anthropics/openclaw-agent-dashboard/discussions) 提问

## 许可证

通过贡献代码，你同意你的代码将在项目的 MIT 许可证下发布。

---

再次感谢你的贡献！