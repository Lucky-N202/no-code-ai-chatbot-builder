'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';

// Define the shape of the data for this complex node
interface ButtonsNodeData {
  text: string;
  buttons: string[];
  onChangeText: (value: string) => void;
  onChangeButton: (index: number, value: string) => void;
  onAddButton: () => void;
  onRemoveButton: (index: number) => void;
}

export function ButtonsNode({ data }: NodeProps<ButtonsNodeData>) {
  return (
    <div className="p-3 border rounded-lg bg-white shadow-md w-72">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-gray-500" />
        <label className="text-xs font-bold text-gray-500">Message with Buttons</label>
      </div>
      
      {/* Input for the main message */}
      <Textarea
        value={data.text}
        className="nodrag resize-none mb-2"
        onChange={(e) => data.onChangeText(e.target.value)}
        rows={3}
      />

      {/* Each button has its own input field and output handle */}
      <div className="space-y-2">
        {data.buttons.map((buttonLabel, index) => (
          <div key={index} className="relative group">
            <Input
              type="text"
              value={buttonLabel}
              className="nodrag pr-8"
              onChange={(e) => data.onChangeButton(index, e.target.value)}
              placeholder={`Button ${index + 1}`}
            />
            {/* The output handle for this specific button */}
            <Handle
              type="source"
              position={Position.Right}
              id={`button-${index}`}
              style={{ top: `${(index + 1) * 48 + 70}px` }} // Position handles dynamically
              className="w-3 h-3 !bg-blue-500"
            />
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={() => data.onRemoveButton(index)}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full mt-3" onClick={data.onAddButton}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Button
      </Button>

      {/* The single input handle for the node */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-teal-500" />
    </div>
  );
}