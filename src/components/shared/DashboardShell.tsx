"use client";

import Header from "@/components/shared/Header"; // Import the client Header here

// This component now owns the client-side parts of the layout
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-slate-50">{children}</main>
    </div>
  );
}