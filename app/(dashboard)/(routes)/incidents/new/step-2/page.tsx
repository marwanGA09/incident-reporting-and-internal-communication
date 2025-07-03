import { prisma } from "@/app/lib/prisma";
import PageTwoForm from "../_components/PageTwoForm";

export default async function Step2() {
  const categories = await prisma.incidentCategory.findMany({
    select: { id: true, name: true },
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className=" flex flex-col max-w-xl mx-auto mt-6 px-6 py-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-bold mb-4">Step 2: Location & Category</h1>

      <PageTwoForm categories={categories} />
    </div>
  );
}
