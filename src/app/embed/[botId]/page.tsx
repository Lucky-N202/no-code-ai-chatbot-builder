// This is a client component because we need to access localStorage to get the bot config.
// In a production app with a database, this page could be a Server Component.
'use client';

import { Chatbot } from "@/components/shared/Chatbot";
import { Node, Edge } from 'reactflow';
import { useState, useEffect } from "react";

export default function EmbedPage({ params }: { params: { botId: string } }) {
  const [botConfig, setBotConfig] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be a public, read-only API call to your database.
    // We access localStorage here, which is only possible on the client.
    const savedState = localStorage.getItem(`bot-${params.botId}`);
    if (savedState) {
        setBotConfig(JSON.parse(savedState));
    }
    setLoading(false);
  }, [params.botId]);
  
  if (loading) {
      return <div className="flex items-center justify-center h-screen bg-gray-100">Loading Bot...</div>;
  }

  if (!botConfig) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">Bot not found.</div>;
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      <div className="h-full w-full md:h-[80%] md:w-[400px] md:max-h-[700px]">
        <Chatbot flow={botConfig} isEmbedded={true} />
      </div>
    </div>
  );
}