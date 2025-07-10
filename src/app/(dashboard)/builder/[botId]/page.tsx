// app/(dashboard)/builder/[botId]/page.tsx

import React from 'react';
import BuilderClient from '@/components/builder/BuilderClient';

/**
 * This is the main page component for the builder.
 * 
 * It is a Server Component, which is the default in the App Router.
 * Its primary responsibility is to handle server-side concerns, like accessing
 * the route parameters (`params`) from the URL.
 * 
 * In modern Next.js, `params` is a Promise. We use `React.use()` to unwrap it.
 * This is the recommended, future-proof way to handle this.
 */
export default function BuilderPage({ params }: { params: Promise<{ botId: string }> }) {
  
  // Use React.use() to synchronously read the value from the params Promise.
  // This can only be done in a Server Component.
  const { botId } = React.use(params);

  // After getting the botId, we render the interactive client component,
  // passing the botId down as a simple string prop.
  return <BuilderClient botId={botId} />;
}