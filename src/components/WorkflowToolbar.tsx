interface WorkflowToolbarProps {
  onAddNode: (type: string) => void;
  onSave: () => void;
  onClear: () => void;
}

export function WorkflowToolbar({ onAddNode, onSave, onClear }: WorkflowToolbarProps) {
  return (
    <div className="flex gap-2 p-4 bg-dark-800 border-b border-dark-600">
      <button
        onClick={() => onAddNode('task')}
        className="px-4 py-2 bg-accent-orange text-dark-900 rounded-lg font-mono text-sm hover:bg-accent-orange/80"
      >
        ➕ 添加任务
      </button>
      <button
        onClick={() => onAddNode('condition')}
        className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg font-mono text-sm hover:bg-dark-600"
      >
        🔀 添加条件
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 bg-accent-green text-dark-900 rounded-lg font-mono text-sm hover:bg-accent-green/80"
      >
        💾 保存
      </button>
      <button
        onClick={onClear}
        className="px-4 py-2 bg-accent-red text-white rounded-lg font-mono text-sm hover:bg-accent-red/80"
      >
        🗑️ 清空
      </button>
    </div>
  );
}
