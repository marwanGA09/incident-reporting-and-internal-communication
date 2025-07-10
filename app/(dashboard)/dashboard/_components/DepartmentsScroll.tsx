// import * as React from "react";

// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { prisma } from "@/app/lib/prisma";
// export async function DepartmentsScroll() {
//   const departmentsObj = await prisma.department.findMany({
//     select: { name: true },
//   });

//   const depArray = departmentsObj.map((dep) => dep.name);
//   return (
//     <ScrollArea className="h-72 w-80 mt-1 rounded-md border">
//       <div className="p-4">
//         <h4 className="mb-4 text-xl text-amber-800 leading-none font-medium ">
//           All Departments
//         </h4>
//         {depArray.map((tag) => (
//           <React.Fragment key={tag}>
//             <div className="text-sm">{tag}</div>
//             <Separator className="my-2" />
//           </React.Fragment>
//         ))}
//       </div>
//     </ScrollArea>
//   );
// }

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/app/lib/prisma";

export async function DepartmentsScroll() {
  const departmentsObj = await prisma.department.findMany({
    select: { name: true },
    orderBy: {
      name: "asc", // Sort departments by name in ascending order
    },
  });

  const depArray = departmentsObj.map((dep: { name: string }) => dep.name);

  return (
    <ScrollArea className="h-72 w-96 mt-2 rounded-xl border shadow-sm">
      <div className="p-4 space-y-3">
        <h4 className="text-lg font-semibold text-amber-700 tracking-wide">
          Departments
        </h4>
        <Separator className="mb-2" />

        {depArray.length === 0 ? (
          <div className="text-sm italic">No departments found.</div>
        ) : (
          depArray.map((name: string) => (
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
