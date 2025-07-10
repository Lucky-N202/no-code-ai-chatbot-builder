import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Bot, MessageSquare, Pencil, Trash, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Import our new server action for fetching bots
import { getUserBots } from '@/app/actions/botActions';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  // Replace mock function with a direct call to our server action
  const bots = await getUserBots();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name}!</h1>
        {/* The link now creates a new UUID for a new bot */}
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
          {/* Note: messageCount is not on our bot model yet, so we'll mock this for now */}
          <CardContent><div className="text-2xl font-bold">0</div></CardContent>
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
                  {/* The delete button still needs its own server action */}
                  <Button variant="destructive" size="sm"><Trash className="h-4 w-4 mr-2" /> Delete</Button>
                </div>
              </div>
            )) : <p className="text-center text-muted-foreground">You haven't created any bots yet. Click "Create New Bot" to get started!</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}