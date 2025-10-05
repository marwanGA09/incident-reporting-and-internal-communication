// app/(dashboard)/dashboard/incidents/page.tsx

import { IncidentManagementTable } from "./_components/IncidentManagementTable";

export default async function IncidentManagementPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Incident Management</h1>
      <IncidentManagementTable />
    </div>
  );
}
