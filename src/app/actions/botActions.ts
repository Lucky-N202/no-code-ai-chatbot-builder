'use server';

import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

// This server-only Supabase client uses the service role key for admin-level access.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Saves or updates a bot's configuration in the database.
 * @param botId The ID of the bot.
 * @param botName The name of the bot.
 * @param botConfig The configuration object (nodes and edges).
 */
export async function saveBot(botId: string, botName: string, botConfig: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Unauthorized: You must be signed in to save a bot.' };
  }

  const userId = session.user.id;

  // Upsert is a powerful command that will UPDATE a row if it exists,
  // or INSERT it if it doesn't. This is perfect for a "save" button.
  const { data, error } = await supabaseAdmin
    .from('bots')
    .upsert({
      id: botId,
      user_id: userId,
      name: botName,
      config: botConfig,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error saving bot:', error);
    return { error: error.message };
  }
  
  // Revalidate the dashboard path to show the new/updated bot immediately.
  revalidatePath('/dashboard');

  return { success: true, data };
}

/**
 * Fetches all bots for the currently logged-in user.
 */
export async function getUserBots() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        // Return an empty array if the user is not logged in, as this might be called on public pages.
        return []; 
    }

    const { data, error } = await supabaseAdmin
        .from('bots')
        .select('id, name, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase error fetching bots:', error);
        return []; // Return empty array on error
    }

    return data;
}