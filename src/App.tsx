import { useState, useEffect } from 'react';
import { Header, AgentGrid, TaskProgress, TaskInput, RightPanel, ToastContainer, SkillsPanel, CommunicationPanel, SettingsPanel, TeamsPanel, WorkflowEditor } from './components';
import { useTeamStore } from './stores/teamStore';
import { useHealthStore } from './stores/healthStore';

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
  const [showSkills, setShowSkills] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommunication, setShowCommunication] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const { teams, currentTeamId, loadTeams } = useTeamStore();
  const { startMonitoring, stopMonitoring } = useHealthStore();

  // Load teams on mount
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Start health monitoring on mount
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  // Get current team name
  const currentTeam = teams.find(t => t.id === currentTeamId);
  const currentTeamName = currentTeam?.name;

  return (
    <main className="min-h-screen bg-dark-900 bg-grid">
      {/* Header */}
      <Header
        onOpenSkills={() => setShowSkills(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTeams={() => setShowTeams(true)}
        onOpenWorkflow={() => setShowWorkflow(true)}
        currentTeamName={currentTeamName}
      />

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

          {/* Quick Actions */}
          <div className="mt-8 p-5 bg-dark-800 rounded-xl border border-dark-600">
            <h3 className="text-xs font-mono text-accent-orange font-semibold mb-3">
              🚀 Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowWorkflow(true)}
                className="px-4 py-2 bg-accent-orange/20 text-accent-orange rounded-lg font-mono text-xs hover:bg-accent-orange/30 transition-all border border-accent-orange/50"
              >
                📊 Workflow
              </button>
              <button
                onClick={() => setShowSkills(true)}
                className="px-4 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-xs hover:bg-dark-600 hover:text-white transition-all"
              >
                🧩 Skills
              </button>
              <button
                onClick={() => setShowCommunication(true)}
                className="px-4 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-xs hover:bg-dark-600 hover:text-white transition-all"
              >
                🔗 Communication
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-xs hover:bg-dark-600 hover:text-white transition-all"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => setShowTeams(true)}
                className="px-4 py-2 bg-dark-700 text-gray-400 rounded-lg font-mono text-xs hover:bg-dark-600 hover:text-white transition-all"
              >
                👥 Teams
              </button>
            </div>
          </div>

          {/* Mode Legend */}
          <div className="mt-4 p-5 bg-dark-800 rounded-xl border border-dark-600">
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

      {/* Skills Panel Modal */}
      <SkillsPanel isOpen={showSkills} onClose={() => setShowSkills(false)} />

      {/* Communication Panel Modal */}
      <CommunicationPanel isOpen={showCommunication} onClose={() => setShowCommunication(false)} />

      {/* Settings Panel Modal */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Teams Panel Modal */}
      <TeamsPanel isOpen={showTeams} onClose={() => setShowTeams(false)} />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Workflow Editor Modal */}
      <WorkflowEditor isOpen={showWorkflow} onClose={() => setShowWorkflow(false)} />
    </main>
  );
}

export default App;