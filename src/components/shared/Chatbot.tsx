'use client';

import { useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Bot } from 'lucide-react';

interface ChatbotProps {
  flow: { nodes: Node[], edges: Edge[] };
  isEmbedded?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  options?: string[]; // Array of button labels for the ButtonsNode
}

export function Chatbot({ flow, isEmbedded = false }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Effect to start the conversation when the flow data is available
  useEffect(() => {
    if (flow.nodes.length > 0) {
      // Find the node with no incoming edges to start the conversation
      const initialNode = flow.nodes.find(node => !flow.edges.some(edge => edge.target === node.id)) || flow.nodes[0];
      if (initialNode) {
        processNode(initialNode);
      }
    }
  }, [flow]);

  // Effect to auto-scroll to the latest message
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isBotTyping]);

  /**
   * Processes a node from the flow, displays it in the chat, and determines the next step.
   * @param node The React Flow node to process.
   */
  const processNode = (node: Node) => {
    setIsBotTyping(true);
    setCurrentNodeId(node.id);

    setTimeout(() => {
      const nodeText = node.data.label || node.data.text || '';
      let botMessage: Message;

      // Create a message object, adding buttons if it's a buttonsNode
      if (node.type === 'buttonsNode' && node.data.buttons?.length > 0) {
        botMessage = { id: node.id, text: nodeText, sender: 'bot', options: node.data.buttons };
      } else {
        botMessage = { id: node.id, text: nodeText, sender: 'bot' };
      }
      
      setMessages(prev => [...prev, botMessage]);
      setIsBotTyping(false);
      
      // If it's a simple message node (no options), automatically check for the next node in the flow.
      if (node.type === 'messageNode') {
        handleNextNode(node.id, null);
      }
    }, 800); // Simulate bot "thinking" time
  };

  /**
   * Finds the next node in the flow based on a source node and a specific handle (for buttons).
   * @param sourceNodeId The ID of the current node.
   * @param sourceHandleId The specific handle that was triggered (e.g., 'button-0'). Can be null for simple nodes.
   */
  const handleNextNode = (sourceNodeId: string, sourceHandleId: string | null) => {
    const outgoingEdge = flow.edges.find(edge => 
        edge.source === sourceNodeId && edge.sourceHandle === sourceHandleId
    );
    
    if (outgoingEdge) {
      const nextNode = flow.nodes.find(node => node.id === outgoingEdge.target);
      if (nextNode) {
        processNode(nextNode);
      }
    }
    // If there's no outgoing edge, the conversation branch ends here.
    // An AI fallback could be triggered here if desired.
  };

  /**
   * Handles the user clicking on one of the option buttons.
   * @param optionText The text of the button clicked.
   * @param optionIndex The index of the button, used to find the correct handle.
   */
  const handleOptionClick = (optionText: string, optionIndex: number) => {
    const userMessage: Message = { id: Date.now().toString(), text: optionText, sender: 'user' };
    
    setMessages(prev => {
      // Find the last bot message and remove its options so they can't be clicked again.
      const lastMessage = prev[prev.length - 1];
      const updatedLastMessage = { ...lastMessage, options: undefined };
      return [...prev.slice(0, -1), updatedLastMessage, userMessage];
    });
    
    // Find the next node connected to this specific button's handle.
    if (currentNodeId) {
      handleNextNode(currentNodeId, `button-${optionIndex}`);
    }
  };

  return (
    <Card className={`flex flex-col h-full w-full shadow-lg ${isEmbedded ? 'border-0 rounded-none' : ''}`}>
      <CardHeader className="bg-slate-800 text-white flex-row items-center p-4 rounded-t-lg">
        <Bot className="h-6 w-6 mr-3" />
        <h3 className="font-bold text-lg">Chatbot Preview</h3>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <div ref={chatContainerRef} className="flex-grow h-full p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index}>
              <div className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
              {/* Render the buttons if they exist on the current message */}
              {msg.options && (
                <div className="flex flex-wrap gap-2 mt-2 justify-start pl-10">
                  {msg.options.map((option, i) => (
                    <Button key={i} size="sm" variant="outline" className="bg-white" onClick={() => handleOptionClick(option, i)}>
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isBotTyping && (
            <div className="flex items-end gap-2 justify-start">
              <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                <div className="flex items-center justify-center space-x-1">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}