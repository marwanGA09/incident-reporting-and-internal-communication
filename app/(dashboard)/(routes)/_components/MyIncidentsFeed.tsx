// app/(dashboard)/(routes)/_components/MyIncidentsFeed.tsx

import { getMyIncidents } from "@/app/lib/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getBadgeVariantForStatus } from "@/lib/getBadgeVariantForStatus";
import { ScrollArea } from "@/components/ui/scroll-area";

export const MyIncidentsFeed = async () => {
  const incidents = await getMyIncidents();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <ul className="space-y-4">
            {incidents.map((incident) => (
              <li key={incident.id} className="border-b pb-4 last:border-b-0 pr-4">
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
