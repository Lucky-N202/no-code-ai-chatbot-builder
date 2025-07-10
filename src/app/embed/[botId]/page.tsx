// app/embed/[botId]/page.tsx
import { Chatbot } from "@/components/shared/Chatbot";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// This is now a Server Component, so we can fetch data directly.
export default async function EmbedPage({ params }: { params: { botId: string } }) {
  
  // We use the public anon key here because this is a public page.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // For this to work, we need to enable public read access on the 'bots' table.
  // We will do that with a new RLS policy.
  const { data: bot, error } = await supabase
    .from('bots')
    .select('config')
    .eq('id', params.botId)
    .single();

  if (error || !bot || !bot.config) {
    // If no bot is found, render the not-found page.
    notFound();
  }

  const flow = bot.config as any;

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      <div className="h-full w-full md:h-[80%] md:w-[400px] md:max-h-[700px]">
        {/* Pass the database-fetched flow to the Chatbot component */}
        <Chatbot flow={{ nodes: flow.nodes, edges: flow.edges }} isEmbedded={true} />
      </div>
    </div>
  );
}