import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { clsx } from 'clsx';
import { useAppStore } from '../stores/appStore';
import { AgentSkillsPanel } from './AgentSkillsPanel';
import type { PanelMode, Agent, Message, Log } from '../types';

const modeConfig: Record<PanelMode, { icon: string; label: string }> = {
  chat: { icon: '💬', label: '对话' },
  properties: { icon: '⚙️', label: '属性' },
  logs: { icon: '📋', label: '日志' },
};

export function RightPanel() {
  const {
    panelMode,
    setPanelMode,
    selectedAgentId,
    agents,
    messages,
    logs,
    logsLoading,
    fileTabs,
    activeFileTab,
    setActiveFileTab,
    currentFile,
    fileLoading,
    fileSaving,
    fileError,
    sendChatMessage,
    saveCurrentFile,
    loadLogs,
    startLogPolling,
    stopLogPolling,
    startAgentPolling,
    stopAgentPolling,
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get selected agent
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // Start polling on mount
  useEffect(() => {
    startAgentPolling();
    return () => {
      stopAgentPolling();
      stopLogPolling();
    };
  }, [startAgentPolling, stopAgentPolling, stopLogPolling]);

  // Update file content when currentFile changes
  useEffect(() => {
    if (currentFile) {
      setFileContent(currentFile.content);
      setIsSaved(true);
    }
  }, [currentFile]);

  // Load logs when in logs mode
  useEffect(() => {
    if (panelMode === 'logs') {
      loadLogs();
      startLogPolling();
    } else {
      stopLogPolling();
    }
  }, [panelMode, loadLogs, startLogPolling, stopLogPolling]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSave = async () => {
    if (!selectedAgentId) return;

    const success = await saveCurrentFile(fileContent);
    if (success) {
      setIsSaved(true);
      setIsEditing(false);
    }
  };

  const handleContentChange = (value: string | undefined) => {
    setFileContent(value || '');
    setIsSaved(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedAgentId || isSending) return;

    setIsSending(true);
    try {
      await sendChatMessage(selectedAgentId, chatInput.trim());
      setChatInput('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter logs by level
  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  // No agent selected
  if (!selectedAgentId || !selectedAgent) {
    return (
      <div className="w-[480px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col">
        {/* Tab Header */}
        <div className="flex items-center gap-2 p-2 bg-dark-800 rounded-t-2xl">
          {(['chat', 'properties', 'logs'] as PanelMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setPanelMode(mode)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-mono transition-all',
                panelMode === mode
                  ? 'bg-dark-700 border border-accent-orange text-accent-orange font-semibold'
                  : 'bg-dark-800 text-gray-500 hover:text-gray-400'
              )}
            >
              {modeConfig[mode].icon} {modeConfig[mode].label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">👆</div>
            <p className="text-gray-500 font-mono text-sm">点击左侧 Agent 卡片查看详情</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[480px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col">
      {/* Tab Header */}
      <div className="flex items-center gap-2 p-2 bg-dark-800 rounded-t-2xl">
        {(['chat', 'properties', 'logs'] as PanelMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setPanelMode(mode)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-mono transition-all',
              panelMode === mode
                ? 'bg-dark-700 border border-accent-orange text-accent-orange font-semibold'
                : 'bg-dark-800 text-gray-500 hover:text-gray-400'
            )}
          >
            {modeConfig[mode].icon} {modeConfig[mode].label}
          </button>
        ))}
      </div>

      {/* Agent Info Header */}
      <div className="px-5 py-3 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{selectedAgent.avatar}</div>
          <div className="flex-1">
            <h3 className="text-white font-mono font-semibold">{selectedAgent.name}</h3>
            <p className="text-xs text-gray-500 font-mono">{selectedAgent.workspace}</p>
          </div>
          <div className={clsx(
            'px-2 py-1 rounded text-xs font-mono',
            selectedAgent.status === 'online' && 'bg-accent-green/20 text-accent-green',
            selectedAgent.status === 'working' && 'bg-accent-orange/20 text-accent-orange',
            selectedAgent.status === 'waiting' && 'bg-blue-500/20 text-blue-400',
            selectedAgent.status === 'offline' && 'bg-gray-500/20 text-gray-400',
            selectedAgent.status === 'error' && 'bg-accent-red/20 text-accent-red',
          )}>
            {selectedAgent.status.toUpperCase()}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedAgent.capabilities.map((cap, i) => (
            <span key={i} className="px-2 py-0.5 bg-dark-700 text-gray-400 rounded text-xs font-mono">
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Content based on mode */}
      {panelMode === 'chat' && (
        <ChatPanel
          messages={messages}
          agents={agents}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isSending={isSending}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          messagesEndRef={messagesEndRef}
        />
      )}

      {panelMode === 'properties' && (
        <div className="flex-1 flex flex-col">
          {/* Agent Info Header */}
          {selectedAgent && (
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedAgent.avatar}</span>
                <div>
                  <h3 className="text-lg font-mono text-white">{selectedAgent.name}</h3>
                  <p className="text-xs text-gray-500">{selectedAgent.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-dark-700">
            <button
              onClick={() => setActiveFileTab('skills')}
              className={clsx(
                'px-4 py-2 text-xs font-mono transition-all',
                activeFileTab === 'skills'
                  ? 'text-accent-orange border-b-2 border-accent-orange'
                  : 'text-gray-500 hover:text-gray-400'
              )}
            >
              🧩 技能管理
            </button>
            {fileTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFileTab(tab)}
                className={clsx(
                  'px-4 py-2 text-xs font-mono transition-all',
                  activeFileTab === tab
                    ? 'text-accent-orange border-b-2 border-accent-orange'
                    : 'text-gray-500 hover:text-gray-400'
                )}
              >
                📄 {tab.replace('.md', '')}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeFileTab === 'skills' && selectedAgent ? (
            <AgentSkillsPanel
              agentId={selectedAgent.id}
              agentName={selectedAgent.name}
            />
          ) : (
            <PropertiesPanel
              fileTabs={fileTabs}
              activeFileTab={activeFileTab}
              setActiveFileTab={setActiveFileTab}
              fileContent={fileContent}
              onContentChange={handleContentChange}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onSave={handleSave}
              isSaved={isSaved}
              fileLoading={fileLoading}
              fileSaving={fileSaving}
              fileError={fileError}
            />
          )}
        </div>
      )}

      {panelMode === 'logs' && (
        <LogsPanel
          logs={filteredLogs}
          agentId={selectedAgentId}
          logsLoading={logsLoading}
          logFilter={logFilter}
          setLogFilter={setLogFilter}
        />
      )}
    </div>
  );
}

// Chat Panel Component
interface ChatPanelProps {
  messages: Message[];
  agents: Agent[];
  chatInput: string;
  setChatInput: (input: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function ChatPanel({ messages, agents, chatInput, setChatInput, isSending, onSendMessage, onKeyPress, messagesEndRef }: ChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 font-mono text-sm">开始对话...</p>
          </div>
        ) : (
          messages.map((msg) => {
            const agent = agents.find(a => a.id === msg.agentId);
            const isUser = msg.agentId === 'user';
            const isSystem = msg.agentId === 'system';

            return (
              <div key={msg.id} className={clsx(
                'flex gap-3',
                isUser && 'flex-row-reverse'
              )}>
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0',
                  isUser ? 'bg-accent-orange' : isSystem ? 'bg-dark-600' : 'bg-dark-700'
                )}>
                  {isUser ? '👤' : isSystem ? '⚙️' : agent?.avatar || '🤖'}
                </div>
                <div className={clsx(
                  'flex-1',
                  isUser && 'text-right'
                )}>
                  <div className={clsx(
                    'flex items-center gap-2 mb-1',
                    isUser && 'justify-end'
                  )}>
                    <span className={clsx(
                      'text-sm font-mono font-semibold',
                      isUser ? 'text-accent-orange' : 'text-white'
                    )}>
                      {msg.agentName}
                    </span>
                    <span className="text-xs text-gray-600">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={clsx(
                    'text-sm font-mono rounded-lg p-2 inline-block',
                    isUser ? 'bg-accent-orange/20 text-gray-200' : 'bg-dark-700 text-gray-400'
                  )}>
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {isSending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-lg animate-pulse">
              ...
            </div>
            <p className="text-gray-500 font-mono text-sm">正在思考...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="输入消息... (Enter 发送)"
            disabled={isSending}
            className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-accent-orange disabled:opacity-50"
          />
          <button
            onClick={onSendMessage}
            disabled={isSending || !chatInput.trim()}
            className={clsx(
              'px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all',
              isSending || !chatInput.trim()
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                : 'bg-accent-orange text-dark-900 hover:bg-accent-orange/90'
            )}
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                发送中
              </span>
            ) : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Properties Panel Component
interface PropertiesPanelProps {
  fileTabs: string[];
  activeFileTab: string;
  setActiveFileTab: (tab: string) => void;
  fileContent: string;
  onContentChange: (value: string | undefined) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
  isSaved: boolean;
  fileLoading: boolean;
  fileSaving: boolean;
  fileError: string | null;
}

function PropertiesPanel({
  fileTabs,
  activeFileTab,
  setActiveFileTab,
  fileContent,
  onContentChange,
  isEditing,
  setIsEditing,
  onSave,
  isSaved,
  fileLoading,
  fileSaving,
  fileError,
}: PropertiesPanelProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* File Tabs */}
      <div className="flex items-center gap-1 p-2 bg-dark-800 mx-4 mt-2 rounded-lg overflow-x-auto">
        {fileTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFileTab(tab)}
            className={clsx(
              'px-3 py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap',
              activeFileTab === tab
                ? 'bg-dark-700 border border-accent-orange text-accent-orange font-semibold'
                : 'bg-dark-800 text-gray-500 hover:text-gray-400'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 m-4 rounded-lg overflow-hidden border border-dark-600 relative">
        {fileLoading ? (
          <div className="h-full flex items-center justify-center bg-dark-800">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-accent-orange" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-gray-500 font-mono text-sm">加载中...</span>
            </div>
          </div>
        ) : fileError ? (
          <div className="h-full flex items-center justify-center bg-dark-800">
            <div className="text-center">
              <span className="text-3xl">⚠️</span>
              <p className="text-accent-red font-mono text-sm mt-2">{fileError}</p>
            </div>
          </div>
        ) : fileContent ? (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={fileContent}
            onChange={onContentChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: 'Monaco, Menlo, monospace',
              lineNumbers: 'on',
              wordWrap: 'on',
              readOnly: !isEditing,
              scrollBeyondLastLine: false,
              padding: { top: 10 },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 font-mono text-sm">加载中...</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-dark-800 mx-4 mb-4 rounded-lg flex items-center justify-between">
        <div className="text-xs text-gray-600 font-mono">
          📄 {activeFileTab} | {fileContent.split('\n').length} 行 | {(fileContent.length / 1024).toFixed(1)} KB
          {isSaved && <span className="text-accent-green ml-2">● 已保存</span>}
          {!isSaved && <span className="text-accent-orange ml-2">● 未保存</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={isSaved || fileSaving}
            className={clsx(
              'px-4 py-2 bg-dark-700 border rounded-lg font-mono text-xs font-semibold transition-all flex items-center gap-2',
              isSaved || fileSaving
                ? 'border-dark-500 text-gray-500 cursor-not-allowed'
                : 'border-accent-orange text-accent-orange hover:bg-dark-600'
            )}
          >
            {fileSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                保存中
              </>
            ) : '💾 保存'}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={clsx(
              'px-4 py-2 bg-dark-700 border rounded-lg font-mono text-xs transition-all',
              isEditing ? 'border-accent-orange text-accent-orange' : 'border-dark-500 text-gray-400'
            )}
          >
            ✏️ {isEditing ? '完成' : '编辑'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Logs Panel Component
interface LogsPanelProps {
  logs: Log[];
  agentId: string;
  logsLoading: boolean;
  logFilter: 'all' | 'info' | 'warn' | 'error' | 'debug';
  setLogFilter: (filter: 'all' | 'info' | 'warn' | 'error' | 'debug') => void;
}

function LogsPanel({ logs, agentId, logsLoading, logFilter, setLogFilter }: LogsPanelProps) {
  const levelColors: Record<string, string> = {
    info: 'text-accent-green',
    warn: 'text-accent-orange',
    error: 'text-accent-red',
    debug: 'text-gray-500',
  };

  const filteredLogs = logs.filter(log => !log.sourceId || log.sourceId === agentId);

  return (
    <div className="flex-1 flex flex-col">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 p-2 bg-dark-800 mx-4 mt-2 rounded-lg">
        <span className="text-xs text-gray-500 font-mono">筛选:</span>
        {(['all', 'info', 'warn', 'error', 'debug'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setLogFilter(level)}
            className={clsx(
              'px-2 py-1 rounded text-xs font-mono transition-all',
              logFilter === level
                ? 'bg-dark-700 text-accent-orange border border-accent-orange'
                : 'bg-dark-800 text-gray-500 hover:text-gray-400'
            )}
          >
            {level === 'all' ? '全部' : level.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto p-4">
        {logsLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-accent-orange" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-gray-500 font-mono text-sm">加载日志...</span>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 font-mono text-sm">暂无日志</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <span className="text-xs text-gray-600 font-mono shrink-0">
                  [{log.timestamp.toLocaleTimeString()}]
                </span>
                <span className={clsx('text-xs font-mono', levelColors[log.level] || 'text-gray-500')}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}