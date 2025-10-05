// app/(dashboard)/dashboard/departments/page.tsx

import { getDepartments } from "@/app/lib/actions";
import { DepartmentTable } from "./_components/DepartmentTable";

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Department Management</h1>
      <DepartmentTable departments={departments} />
    </div>
  );
}
