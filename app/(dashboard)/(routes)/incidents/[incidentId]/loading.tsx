import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 justify-center p-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="text-muted-foreground">
          Loading Incident Details...
        </span>
      </div>
    </div>
  );
}
