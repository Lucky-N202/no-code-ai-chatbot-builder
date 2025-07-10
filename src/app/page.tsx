// app/page.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bot, Zap, LayoutTemplate, Eye, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Import session tools and our new components
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

export default async function LandingPage() {
  // This page is a Server Component, so we can fetch the session directly.
  const session = await getServerSession(authOptions);

  const features = [
    {
      icon: <LayoutTemplate className="h-8 w-8 text-primary" />,
      title: "Visual Flow Builder",
      description: "Design complex conversation flows with our intuitive drag-and-drop node editor. No code required."
    },
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: "Instant Live Preview",
      description: "Test your chatbot in real-time as you build. See your changes instantly in the live preview panel."
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "One-Click Embed",
      description: "Deploy your finished chatbot to any website by copying a single line of code. It's that simple."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Pass the session to the header to make it dynamic */}
      <LandingHeader session={session} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container text-center py-20 sm:py-32">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Build AI Chatbots, Visually
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-600">
            Create, customize, and deploy intelligent chatbots for your website with our intuitive drag-and-drop builder. All backed by a real database.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {/* This is our dynamic Call to Action button */}
            <Button size="lg" asChild>
              <Link href={session ? '/dashboard' : '/sign-up'}>
                {session ? 'Go to Your Dashboard' : 'Get Started for Free'}
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-20 sm:py-24 bg-slate-50 rounded-t-lg">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight">Everything you need, nothing you don't.</h2>
                <p className="mt-2 text-lg leading-8 text-muted-foreground">
                    From idea to a live chatbot in minutes.
                </p>
            </div>
            <div className="mx-auto mt-16 max-w-none">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {features.map((feature) => (
                        <Card key={feature.title} className="text-center">
                            <CardHeader>
                                <div className="flex justify-center mb-4">{feature.icon}</div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}