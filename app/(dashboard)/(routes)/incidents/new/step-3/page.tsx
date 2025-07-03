import { prisma } from "@/app/lib/prisma";
import PageTwoForm from "../_components/PageTwoForm";
import PageThreeForm from "../_components/PageThreeForm";

export default async function Step3() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Step 2: Location & Category</h1>

      <PageThreeForm departments={departments} />
    </div>
  );
}
