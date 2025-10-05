// app/(dashboard)/(routes)/_components/IncidentFeed.tsx

import { getRecentIncidents } from "@/app/lib/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getBadgeVariantForStatus } from "@/lib/getBadgeVariantForStatus";

export const IncidentFeed = async () => {
  const incidents = await getRecentIncidents();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {incidents.map((incident) => (
            <li key={incident.id} className="border-b pb-4 last:border-b-0">
              <Link href={`/incidents/${incident.id}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{incident.title}</h3>
                  <Badge variant={getBadgeVariantForStatus(incident.status)}>
                    {incident.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Severity: {incident.severity}
                </p>
                <p className="text-sm text-muted-foreground">
                  Reported on: {new Date(incident.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Department: {incident.department.name}
                </p>
                {incident.assignee && (
                  <p className="text-sm text-muted-foreground">
                    Assigned to: {incident.assignee.username}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
