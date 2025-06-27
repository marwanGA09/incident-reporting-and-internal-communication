import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/app/lib/prisma";
export async function DepartmentsScroll() {
  const departmentsObj = await prisma.department.findMany({
    select: { name: true },
  });

  const depArray = departmentsObj.map((dep) => dep.name);
  return (
    <ScrollArea className="h-72 w-48 mt-1 rounded-md border bg-amber-100">
      <div className="p-4">
        <h4 className="mb-4 text-xl text-amber-800 leading-none font-medium ">
          All Departments
        </h4>
        {depArray.map((tag) => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
