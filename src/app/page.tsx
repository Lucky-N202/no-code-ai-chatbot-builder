import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bot, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="absolute top-0 left-0 p-4">
        <Bot className="h-8 w-8 text-slate-800" />
      </div>
      <main className="flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900">
          Build AI Chatbots, Visually
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Create, customize, and deploy intelligent chatbots for your website with our intuitive drag-and-drop builder. No code required.
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Get Started for Free <Zap className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}