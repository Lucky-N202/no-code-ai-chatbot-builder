import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Bot, MessageSquare, Pencil, Trash, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

// MOCK: Fetch user's bots from a database in a real app
const getUserBots = async (userId: string) => {
  return [
    { id: 'bot-123', name: 'Sales Bot', messageCount: 150 },
    { id: 'bot-456', name: 'Support Bot', messageCount: 420 },
    { id: 'demo-bot', name: 'Public Demo Bot', messageCount: 999 },
  ];
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
    // Note: The middleware should handle redirection, but this is a safeguard.
    // In v4, the user object might not have an `id` by default unless you add it in the JWT callback.
    // For this demo, checking for `session.user` is sufficient.
    return <p>Access Denied. Please sign in.</p>;
  }

    const bots = await getUserBots("mock-user-id");

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name}!</h1>
        <Button asChild>
          <Link href={`/builder/${uuidv4()}`}><PlusCircle className="mr-2 h-4 w-4" /> Create New Bot</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{bots.length}</div></CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{bots.reduce((sum, bot) => sum + bot.messageCount, 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Chatbots</CardTitle>
          <CardDescription>Manage, edit, and view your created chatbots.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bots.length > 0 ? bots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div>
                  <h3 className="font-semibold">{bot.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {bot.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/embed/${bot.id}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild><Link href={`/builder/${bot.id}`}><Pencil className="h-4 w-4 mr-2" /> Edit</Link></Button>
                  <Button variant="destructive" size="sm"><Trash className="h-4 w-4 mr-2" /> Delete</Button>
                </div>
              </div>
            )) : <p className="text-center text-muted-foreground">You haven't created any bots yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}