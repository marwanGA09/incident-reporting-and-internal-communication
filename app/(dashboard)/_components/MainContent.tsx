"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  console.log({ state });
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        state === "expanded" ? "ml-64" : "ml-12"
      )}
    >
      {children}
    </div>
  );
}
