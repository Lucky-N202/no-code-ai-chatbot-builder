// components/builder/BuilderClient.tsx
'use client';

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
import { ButtonsNode } from '@/components/builder/ButtonsNode';
import { Chatbot } from '@/components/shared/Chatbot';
import { MessageSquarePlus, Save, MessageCircleQuestion } from 'lucide-react';

import { saveBot } from '@/app/actions/botActions'; 
import { supabase } from '@/lib/supabase';

/**
 * Define the node types object outside of the component.
 * This ensures it's a stable constant and doesn't trigger re-renders.
 */
const nodeTypes: NodeTypes = { 
  messageNode: MessageNode,
  buttonsNode: ButtonsNode,
};

export default function BuilderClient({ botId }: { botId: string }) {
  // Base state for nodes and edges from the database
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  // UI and metadata state
  const [botName, setBotName] = useState('My Chatbot');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- START: STABLE CALLBACKS ---
  // These functions are wrapped in `useCallback` with empty dependency arrays,
  // so they are created only once and have a stable reference.
  const updateNodeField = useCallback((nodeId: string, fieldName: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, [fieldName]: value } } : node
      )
    );
  }, []);

  const updateButtonLabel = useCallback((nodeId: string, buttonIndex: number, value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newButtons = [...(node.data.buttons || [])];
          newButtons[buttonIndex] = value;
          return { ...node, data: { ...node.data, buttons: newButtons } };
        }
        return node;
      })
    );
  }, []);

  const addButton = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newButtons = [...(node.data.buttons || []), 'New Option'];
          return { ...node, data: { ...node.data, buttons: newButtons } };
        }
        return node;
      })
    );
  }, []);

  const removeButton = useCallback((nodeId: string, buttonIndex: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newButtons = (node.data.buttons || []).filter((_: any, i: number) => i !== buttonIndex);
          return { ...node, data: { ...node.data, buttons: newButtons } };
        }
        return node;
      })
    );
    setEdges((eds) => eds.filter((edge) => !(edge.source === nodeId && edge.sourceHandle === `button-${buttonIndex}`)));
  }, []);
  // --- END: STABLE CALLBACKS ---

  // `useMemo` creates the array of nodes to be rendered.
  // It "injects" the stable callback functions into each node's data prop.
  // This hook only re-runs if `nodes` or one of the stable callbacks changes (which they won't).
  const nodesWithData = useMemo(() => {
    return nodes.map(node => {
      if (node.type === 'messageNode') {
        return { ...node, data: { ...node.data, onChange: (value: string) => updateNodeField(node.id, 'label', value) } };
      }
      if (node.type === 'buttonsNode') {
        return { ...node, data: { ...node.data, 
          onChangeText: (value: string) => updateNodeField(node.id, 'text', value),
          onChangeButton: (index: number, value: string) => updateButtonLabel(node.id, index, value),
          onAddButton: () => addButton(node.id),
          onRemoveButton: (index: number) => removeButton(node.id, index),
        }};
      }
      return node;
    });
  }, [nodes, updateNodeField, updateButtonLabel, addButton, removeButton]);


  useEffect(() => {
    async function fetchBotData() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bots')
        .select('name, config')
        .eq('id', botId)
        .single();
      
      if (data) {
        setBotName(data.name || 'My Chatbot');
        const config = data.config as any;
        if (config && config.nodes) {
          setNodes(config.nodes); // Set the raw nodes from the DB
          setEdges(config.edges || []);
        }
      } else if (error && error.code !== 'PGRST116') {
        toast.error("Failed to load bot data", { description: error.message });
      } else {
        setNodes([{ id: '1', type: 'messageNode', position: { x: 50, y: 100 }, data: { label: 'Welcome! How can I help?' } }]);
      }
      setIsLoading(false);
    }
    fetchBotData();
  }, [botId]);


  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), []);

  const handleAddMessageNode = () => { /* ... same as before ... */ };
  const handleAddButtonsNode = () => { /* ... same as before ... */ };
  const handleSave = async () => { /* ... same as before ... */ };

  // Re-add implementations for brevity
  const handleAddMessageNodeImpl = () => {
    const newNode: Node = {
      id: uuidv4(), type: 'messageNode', position: { x: Math.random() * 400, y: Math.random() * 200 }, data: { label: 'New Message' },
    };
    setNodes((nds) => nds.concat(newNode));
  };
  const handleAddButtonsNodeImpl = () => {
    const newNode: Node = {
      id: uuidv4(), type: 'buttonsNode', position: { x: Math.random() * 400, y: Math.random() * 200 }, data: { text: 'Please choose an option:', buttons: ['Option 1'] },
    };
    setNodes((nds) => nds.concat(newNode));
  };
  const handleSaveImpl = async () => {
    setIsSaving(true);
    const botConfiguration = { nodes, edges }; // Save the raw nodes
    const result = await saveBot(botId, botName, botConfiguration);
    if (result.error) toast.error("Save Failed", { description: result.error });
    else toast.success("Flow Saved!");
    setIsSaving(false);
  };


  if (isLoading) {
    return <div className="flex items-center justify-center h-full w-full">Loading Builder...</div>;
  }
  
  return (
     <div className="w-full h-[calc(100vh-56px)] grid grid-cols-1 md:grid-cols-3">
       <div className="md:col-span-2 h-full w-full">
         <ReactFlow
           nodes={nodesWithData} // Render the memoized nodes with injected data
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           onConnect={onConnect}
           nodeTypes={nodeTypes} // Render the constant nodeTypes object
           fitView
         >
           <Controls /> <Background />
           <Panel position="top-left" className="p-2 space-y-2 bg-transparent">
             <Input value={botName} onChange={(e) => setBotName(e.target.value)} placeholder="Enter bot name..." className="bg-white/80 backdrop-blur-sm shadow-md" />
             <div className="flex gap-2">
               <Button onClick={handleAddMessageNodeImpl} size="sm" variant="outline" className="bg-white/80 backdrop-blur-sm shadow-md">
                 <MessageSquarePlus className="mr-2 h-4 w-4" /> Add Message
               </Button>
               <Button onClick={handleAddButtonsNodeImpl} size="sm" variant="outline" className="bg-white/80 backdrop-blur-sm shadow-md">
                 <MessageCircleQuestion className="mr-2 h-4 w-4" /> Add Options
               </Button>
               <Button onClick={handleSaveImpl} size="sm" disabled={isSaving} className="shadow-md">
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