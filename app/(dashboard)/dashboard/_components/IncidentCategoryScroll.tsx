import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/app/lib/prisma";

export async function IncidentCategoryScroll() {
  const incidentCategory = await prisma.incidentCategory.findMany({
    select: { name: true },
    orderBy: {
      name: "asc", // Sort departments by name in ascending order
    },
  });

  const catArray = incidentCategory.map((cat: { name: string }) => cat.name);

  return (
    <ScrollArea className="h-72 w-96 mt-2 rounded-xl border shadow-sm">
      <div className="p-4 space-y-3">
        <h4 className="text-lg font-semibold text-amber-700 tracking-wide">
          Incident Categories
        </h4>
        <Separator className="mb-2" />

        {catArray.length === 0 ? (
          <div className="text-sm italic">No Categories found.</div>
        ) : (
          catArray.map((name: string) => (
            <React.Fragment key={name}>
              <div className="text-sm px-2 py-1 hover:bg-accent rounded transition">
                {name}
              </div>
              <Separator className="my-1" />
            </React.Fragment>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
