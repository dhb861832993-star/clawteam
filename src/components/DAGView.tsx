import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface DAGViewProps {
  tasks?: Array<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'blocked';
    dependencies?: string[];
  }>;
}

export function DAGView({ tasks = [] }: DAGViewProps) {
  // 默认示例数据
  const defaultTasks = [
    { id: '1', name: '市场调研', status: 'completed' as const, dependencies: [] },
    { id: '2', name: '内容创作', status: 'running' as const, dependencies: ['1'] },
    { id: '3', name: '设计封面', status: 'pending' as const, dependencies: ['2'] },
    { id: '4', name: '发布小红书', status: 'pending' as const, dependencies: ['3'] },
  ];

  const taskList = tasks.length > 0 ? tasks : defaultTasks;

  // 转换为 ReactFlow 节点
  const nodes = taskList.map((task, index) => ({
    id: task.id,
    type: 'default' as const,
    data: {
      label: (
        <div className={`px-3 py-2 rounded-lg border-2 font-mono text-sm ${
          task.status === 'completed' ? 'border-accent-green bg-green-900/20' :
          task.status === 'running' ? 'border-accent-orange bg-orange-900/20' :
          task.status === 'blocked' ? 'border-accent-red bg-red-900/20' :
          'border-dark-600 bg-dark-800'
        }`}>
          <div className="flex items-center gap-2">
            <span>{task.status === 'completed' ? '✅' : task.status === 'running' ? '🔄' : task.status === 'blocked' ? '🚫' : '⏳'}</span>
            <span>{task.name}</span>
          </div>
        </div>
      ),
    },
    position: { x: 300, y: index * 120 },
  }));

  // 转换为 ReactFlow 边
  const edges = taskList.flatMap(task =>
    task.dependencies?.map(depId => ({
      id: `e${depId}-${task.id}`,
      source: depId,
      target: task.id,
      type: 'smoothstep' as const,
      animated: task.status === 'running',
      style: { stroke: '#FFA500', strokeWidth: 2 },
    })) || []
  );

  const [nodesState, , onNodesChange] = useNodesState(nodes);
  const [edgesState, , onEdgesChange] = useEdgesState(edges);

  return (
    <div className="w-full h-[500px] bg-dark-900">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        defaultEdgeOptions={{ animated: true }}
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const task = taskList.find(t => t.id === node.id);
            return task?.status === 'completed' ? '#44CC44' :
                   task?.status === 'running' ? '#FFA500' :
                   task?.status === 'blocked' ? '#CC4444' : '#888888';
          }}
          maskColor="rgb(26, 26, 26, 0.8)"
        />
        <Background color="#333" gap={20} />
      </ReactFlow>
    </div>
  );
}
