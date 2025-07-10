'use client';

import { useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';

interface ChatbotProps {
  flow: { nodes: Node[], edges: Edge[] };
  isEmbedded?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

async function getAIResponse(prompt: string): Promise<string> {
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });
        const result = await response.json();
        return result.generated_text || "I'm not sure how to respond.";
    } catch (error) {
        console.error("AI Error:", error);
        return "Sorry, my AI brain is offline right now.";
    }
}

export function Chatbot({ flow, isEmbedded = false }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flow.nodes.length > 0) {
      const initialNode = flow.nodes.find(node => !flow.edges.some(edge => edge.target === node.id)) || flow.nodes[0];
      setCurrentNodeId(initialNode.id);
      setMessages([{ id: 'start', text: initialNode.data.label, sender: 'bot' }]);
    }
  }, [flow]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleUserResponse = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    const outgoingEdge = flow.edges.find(edge => edge.source === currentNodeId);
    
    if (outgoingEdge) {
      const nextNode = flow.nodes.find(node => node.id === outgoingEdge.target);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        const botMessage: Message = { id: nextNode.id, text: nextNode.data.label, sender: 'bot' };
        setTimeout(() => setMessages(prev => [...prev, botMessage]), 500);
      }
    } else {
        const aiText = await getAIResponse(text);
        const aiMessage: Message = { id: 'ai-response', text: aiText, sender: 'bot' };
        setTimeout(() => setMessages(prev => [...prev, aiMessage]), 500);
    }
  };

  return (
    <Card className={`flex flex-col h-full w-full shadow-lg ${isEmbedded ? 'border-0 rounded-none' : ''}`}>
      <CardHeader className="bg-slate-800 text-white flex-row items-center p-4 rounded-t-lg">
        <Bot className="h-6 w-6 mr-3" />
        <h3 className="font-bold text-lg">Chatbot Assistant</h3>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <div ref={chatContainerRef} className="flex-grow h-full p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 border-t bg-white rounded-b-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
            if (input.value.trim()) {
              handleUserResponse(input.value.trim());
              input.value = '';
            }
          }}
          className="flex items-center gap-2"
        >
          <Input name="message" placeholder="Type a message..." autoComplete="off" />
          <Button type="submit" aria-label="Send Message"><Send size={18} /></Button>
        </form>
      </div>
    </Card>
  );
}