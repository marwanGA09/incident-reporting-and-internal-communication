// "use server";
// import * as React from "react";

// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { prisma } from "@/app/lib/prisma";

// export async function SelectCategory({
//   onChange,
// }: {
//   onChange: (value: string) => void;
// }) {
//   const category = await prisma.incidentCategory.findMany({
//     where: {
//       isActive: true,
//     },
//   });
//   return (
//     <Select onValueChange={onChange}>
//       <SelectTrigger className="w-[180px]">
//         <SelectValue placeholder="Select a category" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectGroup>
//           <SelectLabel>Incident Category</SelectLabel>
//           {category.map((cate: any) => (
//             <SelectItem value={cate.id}>{cate.name}</SelectItem>
//           ))}
//           {/* <SelectItem value="banana">Banana</SelectItem>
//           <SelectItem value="blueberry">Blueberry</SelectItem>
//           <SelectItem value="grapes">Grapes</SelectItem>
//           <SelectItem value="pineapple">Pineapple</SelectItem> */}
//         </SelectGroup>
//       </SelectContent>
//     </Select>
//   );
// }
"use server";
import { prisma } from "@/app/lib/prisma";
import SelectCategoryClient from "./SelectCategoryClient";

export async function SelectCategory({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const categories = await prisma.incidentCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <SelectCategoryClient
      categories={categories}
      value={value}
      onChange={onChange}
    />
  );
}
