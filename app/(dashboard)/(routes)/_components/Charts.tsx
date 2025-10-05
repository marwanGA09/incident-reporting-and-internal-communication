// app/(dashboard)/(routes)/_components/Charts.tsx

import { getIncidentsByStatus } from "@/app/lib/actions";
import { IncidentsBarChart } from "./IncidentsBarChart";
import { IncidentsPieChart } from "./IncidentsPieChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Charts = async () => {
  const incidentsByStatus = await getIncidentsByStatus();

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Incidents per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentsBarChart />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Incidents by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentsPieChart data={incidentsByStatus} />
        </CardContent>
      </Card>
    </div>
  );
};
