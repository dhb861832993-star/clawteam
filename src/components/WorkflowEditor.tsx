import { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
} from '@xyflow/react';
import type { Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowToolbar } from './WorkflowToolbar';

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

export function WorkflowEditor() {
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
    <div className="w-full h-[600px] bg-dark-900">
      <WorkflowToolbar onAddNode={handleAddNode} onSave={handleSave} onClear={handleClear} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background color="#333" gap={20} />
      </ReactFlow>
    </div>
  );
}
