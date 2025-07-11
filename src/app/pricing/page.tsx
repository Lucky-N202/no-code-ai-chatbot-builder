import PricingClient from "@/components/pricing/PricingClient";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

// Import tools for geolocation and session
import { headers } from 'next/headers';
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

type Currency = 'ZAR' | 'USD';

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

   const headersList = await headers();
  
  // --- Geolocation Logic ---
  // Vercel provides the 'x-vercel-ip-country' header with the user's country code.
    const country = headersList.get('x-vercel-ip-country')?.toUpperCase() || 'USD';
  
  // Determine the currency based on the country code.
  const detectedCurrency: Currency = country === 'ZA' ? 'ZAR' : 'USD';

  return (
    <div className="flex flex-col min-h-screen">
      {/* 
        We use the LandingHeader here, which is already dynamic based on the session.
        This provides a consistent experience.
      */}
      <LandingHeader session={session} />
      
      {/* 
        Render the Client Component and pass the server-detected currency as a prop.
        The client component will handle the rest of the UI and state.
      */}
      <PricingClient detectedCurrency={detectedCurrency} />
      
      <LandingFooter />
    </div>
  );
}