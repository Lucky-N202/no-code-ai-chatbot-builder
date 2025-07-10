import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-slate-50">
      <div className="flex flex-col items-center p-8 border border-slate-200 rounded-lg bg-white shadow-sm">
        <FileQuestion className="h-16 w-16 text-slate-400 mb-6" />
        <h1 className="text-6xl font-extrabold text-slate-800">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-slate-700">Page Not Found</h2>
        <p className="mt-4 max-w-sm text-slate-500">
          Sorry, we couldn't find the page you were looking for. It might have been moved, deleted, or you may have typed the URL incorrectly.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}