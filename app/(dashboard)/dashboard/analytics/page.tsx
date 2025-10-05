// app/(dashboard)/dashboard/analytics/page.tsx

import { getIncidentsByDepartment, getIncidentsByCategory } from "@/app/lib/actions";
import { IncidentsByDepartmentChart } from "./_components/IncidentsByDepartmentChart";
import { IncidentsByCategoryChart } from "./_components/IncidentsByCategoryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const incidentsByDepartment = await getIncidentsByDepartment();
  const incidentsByCategory = await getIncidentsByCategory();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentsByDepartmentChart data={incidentsByDepartment} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentsByCategoryChart data={incidentsByCategory} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
