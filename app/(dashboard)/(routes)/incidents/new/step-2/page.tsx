import { prisma } from "@/app/lib/prisma";
import PageTwoForm from "../_components/PageTwoForm";

export default async function Step2() {
  const categories = await prisma.incidentCategory.findMany({
    select: { id: true, name: true },
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return <PageTwoForm categories={categories} />;
}
