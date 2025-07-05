"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

function getBadgeVariantForStatus(status: string) {
  switch (status) {
    case "REPORTED":
      return "reported";
    case "IN_REVIEW":
      return "inReview";
    case "RESOLVED":
      return "resolved";
    case "CLOSED":
      return "closed";
    default:
      return "default";
  }
}

export default function IncidentsList({ incidents }: { incidents: any[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto">
      {incidents.map((incident) => (
        <Card
          key={incident.id}
          className="rounded-2xl border border-muted bg-background shadow-sm hover:shadow-lg   transition-shadow"
        >
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {incident.title}
              <Badge variant={getBadgeVariantForStatus(incident.status)}>
                {incident.status}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Reported {formatDistanceToNow(new Date(incident.createdAt))} ago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {incident.description && (
              <p className="text-sm">{incident.description}</p>
            )}
            <div className="text-sm text-muted-foreground">
              <strong>Location:</strong> {incident.location || "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Category:</strong> {incident.category?.name}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Department:</strong> {incident.department?.name}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
