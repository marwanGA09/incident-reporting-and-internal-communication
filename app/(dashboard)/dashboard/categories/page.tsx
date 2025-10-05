// app/(dashboard)/dashboard/categories/page.tsx

import { getIncidentCategories } from "@/app/lib/actions";
import { CategoryTable } from "./_components/CategoryTable";

export default async function CategoriesPage() {
  const categories = await getIncidentCategories();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>
      <CategoryTable categories={categories} />
    </div>
  );
}
