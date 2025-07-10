'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  addEdge,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { MessageNode } from '@/components/builder/MessageNode';
import { Button } from '@/components/ui/button';
import { Panel } from 'reactflow';
import { MessageSquarePlus } from 'lucide-react';
import { Chatbot } from '@/components/shared/Chatbot';

const initialNodes: Node[] = [
  { id: '1', type: 'messageNode', position: { x: 50, y: 100 }, data: { label: 'Welcome! How can I help you today?', onChange: () => {} } },
];

export default function BuilderPage({ params }: { params: { botId: string } }) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`bot-${params.botId}`);
    if (savedState) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedState);
      // We need to re-assign the onChange function to the loaded nodes
      const nodesWithCallbacks = savedNodes.map((node: Node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: (value: string) => updateNodeData(node.id, value),
        },
      }));
      setNodes(nodesWithCallbacks);
      setEdges(savedEdges);
    }
  }, [params.botId]);

  const updateNodeData = useCallback((nodeId: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, label: value } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const nodeTypes: NodeTypes = useMemo(() => ({ 
    messageNode: (props) => (
      <MessageNode {...props} data={{ ...props.data, onChange: (value: string) => updateNodeData(props.id, value) }} />
    )
  }), [updateNodeData]);

  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

  const handleAddNode = () => {
    const newNode: Node = {
      id: uuidv4(),
      type: 'messageNode',
      position: { x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 },
      data: { label: 'New Message', onChange: (value: string) => updateNodeData(newNode.id, value) },
    };
    setNodes((nds) => nds.concat(newNode));
  };
  
  const handleSave = () => {
    // We strip the onChange function before saving, as it's not serializable.
    const nodesToSave = nodes.map(node => {
        const { onChange, ...restData } = node.data;
        return { ...node, data: restData };
    });

    const botConfiguration = { nodes: nodesToSave, edges };
    localStorage.setItem(`bot-${params.botId}`, JSON.stringify(botConfiguration));
    toast.success("Flow Saved", {
      description: "Your chatbot configuration has been saved locally.",
    });
  };

  return (
    <div className="w-full h-[calc(100vh-56px)] grid grid-cols-3">
       <div className="col-span-2" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
            <Panel position="top-left" className="p-4">
                <div className="flex gap-2">
                    <Button onClick={handleAddNode} size="sm" variant="outline" className="bg-white">
                        <MessageSquarePlus className="mr-2 h-4 w-4" /> Add Message
                    </Button>
                    <Button onClick={handleSave} size="sm">Save Flow</Button>
                </div>
            </Panel>
          </ReactFlow>
       </div>
       <div className="col-span-1 border-l bg-slate-100 p-4">
            <h3 className="text-xl font-bold mb-4">Live Preview</h3>
            <div className="h-[calc(100%-4rem)] rounded-lg overflow-hidden">
                <Chatbot flow={{ nodes, edges }} />
            </div>
       </div>
    </div>
  );
}