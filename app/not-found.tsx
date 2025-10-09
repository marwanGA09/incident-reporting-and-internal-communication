import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-8">Page Not Found</h2>
      <p className="text-lg text-center mb-8 max-w-md">
        We're sorry, but the page you requested could not be found. It might have been moved or deleted.
      </p>
      <Link href="/">
        <Button>Go back to Home</Button>
      </Link>
    </div>
  );
}
