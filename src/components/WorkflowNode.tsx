import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export function WorkflowNode({ data, selected }: NodeProps) {
  const label = (data as any).label as string;
  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 font-mono text-sm ${
        selected
          ? 'border-accent-orange bg-dark-700'
          : 'border-dark-600 bg-dark-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-accent-orange" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent-orange" />
    </div>
  );
}
