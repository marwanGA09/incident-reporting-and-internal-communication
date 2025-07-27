import { prisma } from "@/app/lib/prisma";
import PageThreeForm from "../_components/PageThreeForm";

export default async function Step3() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl mx-auto mt-6 px-6 py-8 border shadow-lg rounded-lg flex flex-col ">
      <h1 className="text-xl font-bold mb-4">
        Step 3: Department & Assignment
      </h1>

      <PageThreeForm departments={departments} />
    </div>
  );
}
