'use client';

import Link from 'next/link';
import { Bot, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { signOut } from 'next-auth/react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Bot className="h-6 w-6" />
            <span className="font-bold">ChatBuilder</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Dashboard
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Pricing
            </Link>
            {/* 
              This button calls the signOut function from next-auth.
              The `callbackUrl` tells Next.js where to redirect the user AFTER
              they have been successfully signed out. The homepage is a perfect destination.
            */}
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4 mr-2"/>
                Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}