import { Handle, Position, NodeProps } from 'reactflow';
import { Textarea } from '@/components/ui/textarea'; 
import { MessageSquare } from 'lucide-react';
import React from 'react';

// Define a type for our node's data
interface MessageNodeData {
  label: string;
  onChange: (value: string) => void;
}

export function MessageNode({ data }: NodeProps<MessageNodeData>) {
  return (
    <div className="p-2 border rounded-lg bg-white shadow-md w-64">
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-teal-500" />
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-gray-500" />
        <label className="text-xs font-bold text-gray-500">Bot Message</label>
      </div>
      <div>
        <Textarea 
          defaultValue={data.label} 
          className="nodrag resize-none" // Prevents dragging the node when interacting with the textarea
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => data.onChange(e.target.value)}
          rows={3}
        />
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-teal-500" />
    </div>
  );
}