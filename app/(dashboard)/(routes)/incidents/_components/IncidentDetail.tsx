"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getBadgeVariantForStatus } from "@/lib/getBadgeVariantForStatus";

export default function IncidentDetail({
  incident,
  clerkUsersMap,
}: {
  incident: any;
  clerkUsersMap: Record<string, { name: string; email: string }>;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {incident.title}
            <Badge
              variant={getBadgeVariantForStatus(incident.status)}
              className="text-sm px-4 py-1"
            >
              {incident.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            Created: {format(new Date(incident.createdAt), "PPPppp")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{incident.description || "No description provided."}</p>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <strong>Location:</strong> {incident.location || "N/A"}
            </div>
            <div>
              <strong>Category:</strong> {incident.category.name}
              {incident.category.description && (
                <> - {incident.category.description}</>
              )}
            </div>
            <div>
              <strong>Department:</strong> {incident.department.name}
              {incident.department.email && <> - {incident.department.email}</>}
            </div>
            <div>
              <strong>Assigned To:</strong>{" "}
              {incident.assignedToId
                ? `${clerkUsersMap[incident.assignedToId]?.name} (${
                    clerkUsersMap[incident.assignedToId]?.email
                  })`
                : "Not Assigned"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Status Change History</CardTitle>
          <CardDescription>
            All changes with notes and who made them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incident.statusNotes.length === 0 ? (
            <p className="text-muted-foreground">No status changes yet.</p>
          ) : (
            <ScrollArea className="h-80 pr-2">
              <div className="space-y-4">
                {incident.statusNotes.map((note: any) => (
                  <div
                    key={note.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant={getBadgeVariantForStatus(note.status)}>
                        {note.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.changedAt), "PPPppp")}
                      </span>
                    </div>
                    <div className="text-sm">{note.note}</div>
                    <div className="text-xs text-muted-foreground">
                      By:{" "}
                      {note.changedById
                        ? `${clerkUsersMap[note.changedById]?.name} (${
                            clerkUsersMap[note.changedById]?.email
                          })`
                        : "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
