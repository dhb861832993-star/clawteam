# Agent 模板库

参考自：https://github.com/msitarzewski/agency-agents

---

## 💻 Engineering Division（工程部门）

### 🎨 Frontend Developer（前端开发者）

**专长**：React/Vue/Angular, UI 实现，性能优化

**何时使用**：
- 现代 Web 应用开发
- 像素级完美 UI
- Core Web Vitals 优化

**核心工作流**：
1. 需求分析 → 技术选型
2. 组件设计 → 代码实现
3. 性能优化 → 测试部署

**交付物**：
- 可运行的组件代码
- 性能测试报告
- 部署配置

---

### 🏗️ Backend Architect（后端架构师）

**专长**：API 设计，数据库架构，可扩展性

**何时使用**：
- 服务端系统开发
- 微服务架构
- 云基础设施

**核心工作流**：
1. 需求分析 → 架构设计
2. API 定义 → 数据库设计
3. 实现 → 测试 → 部署

**交付物**：
- 系统架构图
- API 文档
- 数据库 Schema

---

### 🤖 AI Engineer（AI 工程师）

**专长**：ML 模型，部署，AI 集成

**何时使用**：
- 机器学习功能开发
- 数据管道构建
- AI 驱动的应用

**交付物**：
- 训练好的模型
- 推理 API
- 集成文档

---

### 🚀 DevOps Automator（DevOps 自动化师）

**专长**：CI/CD, 基础设施自动化，云运维

**何时使用**：
- 管道开发
- 部署自动化
- 监控系统

**交付物**：
- CI/CD 配置
- 基础设施代码
- 监控仪表板

---

### 🔒 Security Engineer（安全工程师）

**专长**：威胁建模，安全代码审查，安全架构

**何时使用**：
- 应用安全评估
- 漏洞评估
- 安全 CI/CD

**交付物**：
- 安全审计报告
- 威胁模型
- 安全配置

---

## 🎨 Design Division（设计部门）

### 🎯 UI Designer（UI 设计师）

**专长**：视觉设计，组件库，设计系统

**何时使用**：
- 界面创建
- 品牌一致性
- 组件设计

**交付物**：
- 设计稿（Figma/Sketch）
- 组件库
- 设计规范

---

### 🔍 UX Researcher（UX 研究员）

**专长**：用户测试，行为分析，调研

**何时使用**：
- 理解用户需求
- 可用性测试
- 设计洞察

**交付物**：
- 用户研究报告
- 可用性测试结果
- 用户画像

---

### ✨ Whimsy Injector（趣味注入师）

**专长**：个性，愉悦感， playful 交互

**何时使用**：
- 添加快乐元素
- 微交互设计
- 彩蛋设计
- 品牌个性

**交付物**：
- 微交互设计
- 动画效果
- 品牌个性指南

---

## 📢 Marketing Division（市场部门）

### 🚀 Growth Hacker（增长黑客）

**专长**：快速用户获取，病毒循环，实验

**何时使用**：
- 爆炸性增长
- 用户获取
- 转化优化

**交付物**：
- 增长实验计划
- 病毒循环设计
- A/B 测试结果

---

### 📝 Content Creator（内容创作者）

**专长**：多平台内容，编辑日历

**何时使用**：
- 内容策略
- 文案撰写
- 品牌故事

**交付物**：
- 内容日历
- 文案草稿
- 品牌故事

---

### 🤝 Reddit Community Builder（Reddit 社区建设者）

**专长**：真实互动，价值驱动内容

**何时使用**：
- Reddit 策略
- 社区信任建立
- 真实营销

**交付物**：
- 社区参与计划
- 内容策略
- 信任建立指南

---

## 💼 Sales Division（销售部门）

### 🎯 Outbound Strategist（外展策略师）

**专长**：信号驱动的潜在客户开发，多渠道序列

**何时使用**：
- 建立销售渠道
- 研究驱动的外展
- 非体积导向

**交付物**：
- 潜在客户列表
- 外展序列
- 回复模板

---

### 🔍 Discovery Coach（发现教练）

**专长**：SPIN, Gap Selling, Sandler - 问题设计和电话结构

**何时使用**：
- 准备发现电话
- 资格评估机会
- 销售代表培训

**交付物**：
- 问题列表
- 电话脚本
- 资格框架

---

### ♟️ Deal Strategist（交易策略师）

**专长**：MEDDPICC 资格，竞争定位，获胜计划

**何时使用**：
- 交易评分
- 暴露管道风险
- 建立获胜策略

**交付物**：
- MEDDPICC 评分表
- 竞争分析
- 获胜计划

---

## 🎭 使用指南

### 1. 选择 Agent

根据任务类型选择合适的 Agent：
- 开发任务 → Engineering
- 设计任务 → Design
- 营销任务 → Marketing
- 销售任务 → Sales

### 2. 激活 Agent

在任务描述中指定 Agent 角色：

```
激活 Frontend Developer 模式，帮我构建一个 React 组件...

激活 Growth Hacker 模式，帮我设计用户获取策略...

激活 UI Designer 模式，帮我设计一个登录页面...
```

### 3. 提供上下文

给 Agent 提供足够的上下文：
- 项目背景
- 目标用户
- 技术栈
- 时间限制

### 4. 验收交付物

根据 Agent 的交付物清单验收：
- 代码质量
- 文档完整性
- 性能指标

---

## 📊 工作流与 Agent 绑定

### 绑定方式

在工作流编辑器中，可以将特定节点绑定到指定的 Agent 角色：

```yaml
# 工作流节点配置示例
workflow:
  name: "产品发布流程"
  nodes:
    - id: "requirement-analysis"
      name: "需求分析"
      assignedAgent: "analyst"      # 绑定分析师 Agent
      skills: ["research", "docs"]

    - id: "ui-design"
      name: "UI 设计"
      assignedAgent: "designer"     # 绑定设计师 Agent
      skills: ["figma", "prototyping"]

    - id: "frontend-dev"
      name: "前端开发"
      assignedAgent: "frontend-developer"  # 绑定前端开发者 Agent
      skills: ["react", "typescript"]

    - id: "backend-dev"
      name: "后端开发"
      assignedAgent: "backend-architect"   # 绑定后端架构师 Agent
      skills: ["api", "database"]
```

### 绑定示例

```
[截图位置：工作流节点绑定界面]
┌─────────────────────────────────────────────────────────────────┐
│  工作流节点配置                                                 │
├─────────────────────────────────────────────────────────────────┤
│  节点名称: 前端开发                                             │
│                                                                 │
│  绑定 Agent:                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 选择 Agent 角色...                          [▼]        ││
│  │                                                             ││
│  │ 推荐选项:                                                   ││
│  │   🎨 Frontend Developer - 擅长 React/Vue/Angular           ││
│  │   🏗️ Backend Architect - 擅长 API/数据库                   ││
│  │   🤖 AI Engineer - 擅长 ML/AI 集成                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  所需技能:                                                      │
│  ☑️ react       ☑️ typescript    ☐ testing    ☐ deployment    │
│                                                                 │
│  预计时长: [  30  ] 分钟                                        │
│                                                                 │
│  [取消] [保存]                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Agent 协作关系

### 协作关系类型

| 关系类型 | 说明 | 示例 |
|----------|------|------|
| **顺序执行** | Agent A 完成后，Agent B 开始 | 分析师 → 写手 |
| **并行执行** | 多个 Agent 同时执行 | 设计师 ∥ 开发者 |
| **条件触发** | 满足条件时触发下一个 Agent | 审核通过 → 发布 |
| **消息传递** | Agent 之间通信协作 | 队长 ↔ 成员 |

### 典型协作模式

#### 1. 瀑布式协作

```yaml
# 顺序执行的协作关系
name: "内容发布流程"
collaboration:
  - from: "analyst"
    to: "writer"
    type: "sequential"
    trigger: "analysis_complete"

  - from: "writer"
    to: "designer"
    type: "sequential"
    trigger: "content_ready"

  - from: "designer"
    to: "operator"
    type: "sequential"
    trigger: "design_approved"
```

#### 2. 并行协作

```yaml
# 并行执行的协作关系
name: "产品开发流程"
collaboration:
  parallel:
    - agents: ["frontend-developer", "backend-architect"]
      sync_point: "integration"

  - from: "integration"
    to: "tester"
    type: "sequential"
```

#### 3. 中心辐射式协作

```yaml
# 以队长为中心的协作关系
name: "团队协作模式"
collaboration:
  hub: "leader"
  spokes:
    - "frontend-developer"
    - "backend-architect"
    - "designer"
    - "analyst"
  communication: "broadcast"  # 队长广播消息给所有成员
```

### 协作关系可视化

```
[截图位置：协作关系图示例]
┌─────────────────────────────────────────────────────────────────┐
│  🔗 Agent 协作关系图 - 内容创作团队                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      ┌─────────────┐                           │
│                      │   🦁 队长   │                           │
│                      │   LEADER    │                           │
│                      │  (协调者)   │                           │
│                      └──────┬──────┘                           │
│                             │                                   │
│           ┌─────────────────┼─────────────────┐               │
│           │                 │                 │               │
│           ▼                 ▼                 ▼               │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐         │
│  │  📊 分析师  │   │  ✍️ 写手    │   │  🎨 设计师  │         │
│  │  ANALYST    │──▶│  WRITER     │──▶│  DESIGNER   │         │
│  │             │   │             │   │             │         │
│  └─────────────┘   └─────────────┘   └──────┬──────┘         │
│                                             │                 │
│                                             ▼                 │
│                                    ┌─────────────┐           │
│                                    │  ⚙️ 运营    │           │
│                                    │  OPERATOR   │           │
│                                    │             │           │
│                                    └─────────────┘           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  图例: ──▶ 顺序执行    ═══▶ 并行执行    - -▶ 条件触发         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 完整列表

参考完整仓库：https://github.com/msitarzewski/agency-agents

**总计**：140+ 专业 Agent

**分类**：
- Engineering (20+)
- Design (10+)
- Marketing (20+)
- Sales (10+)
- Paid Media (10+)
- Product (10+)
- Project Management (10+)
- Support (10+)
- Strategy (10+)
- Specialized (20+)

---

**更新日期**: 2026-03-15
**参考来源**: agency-agents (45.7k ⭐)
