// app/(dashboard)/(routes)/_components/StatsCards.tsx

import {
  getActiveIncidentsCount,
  getIncidentsReportedTodayCount,
  getMyOpenIncidentsCount,
} from "@/app/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, UserCheck } from "lucide-react";

export const StatsCards = async () => {
  const [activeIncidents, todaysIncidents, myOpenIncidents] = await Promise.all([
    getActiveIncidentsCount(),
    getIncidentsReportedTodayCount(),
    getMyOpenIncidentsCount(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeIncidents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reported Today</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todaysIncidents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Open Incidents</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{myOpenIncidents}</div>
        </CardContent>
      </Card>
    </div>
  );
};
