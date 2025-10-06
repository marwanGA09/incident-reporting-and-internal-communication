"use client";

import { useEffect } from "react";
import logger from "./lib/logger";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console and any other logging service
    logger.error({ error, digest: error.digest }, "Unhandled error");
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="max-w-md p-8 text-center bg-card rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground mb-6">
          We've logged the issue and our team will look into it. Please try
          again.
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
