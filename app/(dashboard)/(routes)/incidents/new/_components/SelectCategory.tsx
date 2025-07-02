// "use server";
// import { prisma } from "@/app/lib/prisma";
// import SelectCategoryClient from "./SelectCategoryClient";

// export async function SelectCategory({
//   categories,
// }: {
//   categories: { id: string; name: string }[];
// }) {
//   // const categories = await prisma.incidentCategory.findMany({
//   //   where: { isActive: true },
//   //   orderBy: { name: "asc" },
//   // });
//   // console.log({ categories });
//   return <SelectCategoryClient categories={categories} />;
// }
