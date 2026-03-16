import { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
} from '@xyflow/react';
import type { Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowToolbar } from './WorkflowToolbar';

interface WorkflowEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

let nodeId = 0;
const getNodePosition = () => ({
  x: Math.random() * 400 + 100,
  y: Math.random() * 300 + 100,
});

const initialNodes = [
  { id: '1', type: 'default', data: { label: '📊 市场调研' }, position: { x: 250, y: 0 } },
  { id: '2', type: 'default', data: { label: '✍️ 内容创作' }, position: { x: 250, y: 100 } },
  { id: '3', type: 'default', data: { label: '🎨 设计封面' }, position: { x: 250, y: 200 } },
  { id: '4', type: 'default', data: { label: '📱 发布小红书' }, position: { x: 250, y: 300 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

export function WorkflowEditor({ isOpen, onClose }: WorkflowEditorProps) {
  if (!isOpen) return null;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback((type: string) => {
    const newNode = {
      id: String(nodeId++),
      type: 'default',
      data: { label: type === 'task' ? '📝 新任务' : '🔀 条件' },
      position: getNodePosition(),
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleSave = useCallback(() => {
    const workflow = { nodes, edges };
    console.log('保存工作流:', workflow);
    localStorage.setItem('workflow', JSON.stringify(workflow));
    alert('工作流已保存！');
  }, [nodes, edges]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[900px] h-[650px] bg-dark-900 rounded-2xl border border-dark-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-mono font-semibold text-accent-orange">📊 工作流编辑器</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              拖拽式工作流设计工具
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <WorkflowToolbar onAddNode={handleAddNode} onSave={handleSave} onClear={handleClear} />

        {/* Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                const label = (node.data as any).label as string;
                return label.includes('📊') ? '#44CC44' :
                       label.includes('✍️') ? '#FFA500' :
                       label.includes('🎨') ? '#FF69B4' :
                       label.includes('📱') ? '#4488CC' : '#888888';
              }}
              maskColor="rgb(26, 26, 26, 0.8)"
            />
            <Background color="#333" gap={20} />
          </ReactFlow>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-700 bg-dark-800">
          <div className="flex items-center justify-between text-xs font-mono text-gray-500">
            <span>📝 拖拽节点调整位置 · 连接点创建依赖</span>
            <span>{nodes.length} 节点 · {edges.length} 连接</span>
          </div>
        </div>
      </div>
    </div>
  );
}
