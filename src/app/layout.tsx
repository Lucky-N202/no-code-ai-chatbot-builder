// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import the new top-level provider wrapper
import Providers from "@/components/shared/Providers"; 

// Import the v4 session fetching tools
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "No-Code AI Chatbot Builder",
  description: "Build and deploy AI chatbots with a drag-and-drop interface.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch the session on the server
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {/*
          Render the client-side Providers component and pass the server-fetched
          session and the server-rendered `children` (your pages) to it.
        */}
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}