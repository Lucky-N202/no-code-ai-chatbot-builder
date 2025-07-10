"use client"; 

// All the imports from your original page.tsx go here
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageNode } from '@/components/builder/MessageNode';
import { Chatbot } from '@/components/shared/Chatbot';
import { MessageSquarePlus, Save } from 'lucide-react';

import { saveBot } from '@/app/actions/botActions'; 
import { supabase } from '@/lib/supabase';

// The key change is here: we now accept botId as a simple string prop
export default function BuilderClient({ botId }: { botId: string }) {
  // All the state and logic from your original page.tsx is moved here
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [botName, setBotName] = useState('My Chatbot');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const updateNodeData = useCallback((nodeId: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, label: value } };
        }
        return node;
      })
    );
  }, []);

  useEffect(() => {
    async function fetchBotData() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bots')
        .select('name, config')
        .eq('id', botId) // Use the botId prop here
        .single();
      
      if (data) {
        setBotName(data.name || 'My Chatbot');
        const config = data.config as any;
        if (config && config.nodes) {
          const nodesWithCallbacks = config.nodes.map((node: Node) => ({
            ...node,
            data: { ...node.data, onChange: (value: string) => updateNodeData(node.id, value) },
          }));
          setNodes(nodesWithCallbacks);
          setEdges(config.edges || []);
        }
      } else if (error && error.code !== 'PGRST116') {
        toast.error("Failed to load bot data", { description: error.message });
      } else {
        const firstNodeId = '1';
        setNodes([{ 
          id: firstNodeId, type: 'messageNode', position: { x: 50, y: 100 }, 
          data: { label: 'Welcome! How can I help?', onChange: (value: string) => updateNodeData(firstNodeId, value) } 
        }]);
      }
      setIsLoading(false);
    }
    fetchBotData();
  }, [botId, updateNodeData]);

  const handleSave = async () => {
    setIsSaving(true);
    const nodesToSave = nodes.map(node => {
        const { onChange, ...restData } = node.data;
        return { ...node, data: restData };
    });
    const botConfiguration = { nodes: nodesToSave, edges };
    const result = await saveBot(botId, botName, botConfiguration); // Use the botId prop

    if (result.error) {
      toast.error("Save Failed", { description: result.error });
    } else {
      toast.success("Flow Saved!");
    }
    setIsSaving(false);
  };
  
  // The rest of your component logic and JSX remains exactly the same...
  // (nodeTypes, onNodesChange, handleAddNode, return statement, etc.)
  // ...
  const nodeTypes: NodeTypes = useMemo(() => ({ messageNode: MessageNode }), []);
  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);
  const handleAddNode = () => { /* ... */ };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-full w-full">Loading Builder...</div>;
  }
  
  return (
     <div className="w-full h-[calc(100vh-56px)] grid grid-cols-1 md:grid-cols-3">
       <div className="md:col-span-2 h-full w-full">
         <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
           <Controls /> <Background />
           <Panel position="top-left" className="p-2 space-y-2 bg-transparent">
             <Input value={botName} onChange={(e) => setBotName(e.target.value)} placeholder="Enter bot name..." className="bg-white/80 backdrop-blur-sm shadow-md" />
             <div className="flex gap-2">
               <Button onClick={handleAddNode} size="sm" variant="outline" className="bg-white/80 backdrop-blur-sm shadow-md">
                 <MessageSquarePlus className="mr-2 h-4 w-4" /> Add Message
               </Button>
               <Button onClick={handleSave} size="sm" disabled={isSaving} className="shadow-md">
                 <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save Flow"}
               </Button>
             </div>
           </Panel>
         </ReactFlow>
       </div>
       <div className="md:col-span-1 border-l bg-slate-100 p-4 h-full hidden md:block">
         <h3 className="text-xl font-bold mb-4">Live Preview</h3>
         <div className="h-[calc(100%-4rem)] rounded-lg overflow-hidden">
           <Chatbot flow={{ nodes, edges }} />
         </div>
       </div>
     </div>
  );
}