import { Header, AgentGrid, TaskProgress, TaskInput, RightPanel } from './components';

// Mock task steps
const mockSteps = [
  { id: '1', name: 'ANALYZE', status: 'completed' as const },
  { id: '2', name: 'PROTOTYPE', status: 'completed' as const },
  { id: '3', name: 'AVATAR', status: 'running' as const },
  { id: '4', name: 'DEPEND', status: 'pending' as const },
  { id: '5', name: 'EXPORT', status: 'pending' as const },
  { id: '6', name: 'REVIEW', status: 'pending' as const },
];

function App() {
  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex p-6 gap-6">
        {/* Left Side - Agent Grid & Tasks */}
        <div className="flex-1">
          {/* Task Progress */}
          <TaskProgress steps={mockSteps} progress={60} />

          {/* Task Input */}
          <div className="mb-8">
            <TaskInput />
          </div>

          {/* Agent Grid */}
          <AgentGrid />

          {/* Mode Legend */}
          <div className="mt-8 p-5 bg-dark-800 rounded-xl border border-dark-600">
            <h3 className="text-xs font-mono text-accent-orange font-semibold mb-3">
              💡 智能模式切换
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex gap-3">
                <span className="text-gray-500">💬 对话模式：</span>
                <span className="text-gray-400">显示聊天记录 + 输入框</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-500">⚙️ 属性模式：</span>
                <span className="text-accent-orange">隐藏聊天框，最大化编辑空间</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-500">📋 日志模式：</span>
                <span className="text-gray-400">隐藏聊天框，专注日志流</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Panel */}
        <RightPanel />
      </div>
    </div>
  );
}

export default App;