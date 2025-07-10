// components/shared/Providers.tsx

"use client"; // This is the top-level client boundary

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { Toaster } from "@/components/ui/sonner"; // Sonner is a client component

type Props = {
  children: React.ReactNode;
  session?: Session | null;
};

// This component now wraps all client-side providers
export default function Providers({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster richColors position="top-right" />
    </SessionProvider>
  );
}