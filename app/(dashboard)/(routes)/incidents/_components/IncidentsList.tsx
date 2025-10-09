"use client";

import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Siren,
  ShieldAlert,
  AlertTriangle,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Incident, User } from "@prisma/client";
import { IncidentSkeleton } from "./IncidentSkeleton";
import { textShorter } from "@/lib/textShorter";

import { cn } from "@/lib/utils";

// Helper to get color and icon for severity
const getSeverityProps = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return { icon: <Siren className="h-4 w-4" />, color: "bg-red-500" };
    case "HIGH":
      return {
        icon: <ShieldAlert className="h-4 w-4" />,
        color: "bg-orange-500",
      };
    case "MEDIUM":
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: "bg-yellow-500",
      };
    default:
      return { icon: null, color: "bg-gray-500" };
  }
};

// Helper to get icon and label for priority
const getPriorityProps = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return {
        icon: <Flame className="h-4 w-4 text-red-500" />,
        label: "Urgent",
      };
    case "HIGH":
      return {
        icon: <ArrowUp className="h-4 w-4 text-orange-500" />,
        label: "High",
      };
    case "NORMAL":
      return {
        icon: <Minus className="h-4 w-4 text-blue-500" />,
        label: "Normal",
      };
    case "LOW":
      return {
        icon: <ArrowDown className="h-4 w-4 text-gray-500" />,
        label: "Low",
      };
    default:
      return { icon: null, label: priority };
  }
};

// Helper for the new status ribbon color
const getRibbonColorForStatus = (status: string) => {
  switch (status) {
    case "RESOLVED":
      return "bg-green-600";
    case "CLOSED":
      return "bg-gray-500";
    case "IN_PROGRESS":
      return "bg-blue-600";
    default:
      return "bg-slate-800";
  }
};

function IncidentItem({
  incident,
}: {
  incident: Incident & { isRead: boolean; assignee: User | null };
}) {
  const { icon, color } = getSeverityProps(incident.severity);
  const priorityProps = getPriorityProps(incident.priority);

  return (
    <Link href={`/incidents/${incident.id}`} className="block h-full">
      <Card
        key={incident.id}
        className={cn(
          `relative rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:ring-2 hover:ring-primary transition-all pb-8 h-full overflow-hidden`,
          incident.status === "CLOSED" && "opacity-60 grayscale"
        )}
      >
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${color}`}>{icon}</div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500">
                  INC-{String(incident.incidentNumber).padStart(5, "0")}
                </span>
                <span className="font-bold text-lg">
                  {textShorter(incident.title, 20)}
                </span>
              </div>
            </div>
            {/* Status badge is removed */}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground pt-2">
            Occurred {formatDistanceToNow(new Date(incident.occurredAt))} ago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground line-clamp-3">
            {incident.description}
          </p>
          <div className="text-muted-foreground pt-2">
            <strong>Location:</strong> {incident.locationAddress || "N/A"}
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <strong>Priority:</strong>
            {priorityProps.icon}
            <span>{priorityProps.label}</span>
          </div>
          <div className="text-muted-foreground">
            <strong>Assignee:</strong>{" "}
            {incident.assignee
              ? `${incident.assignee.firstName || ""} ${
                  incident.assignee.lastName || ""
                }`.trim()
              : "Unassigned"}
          </div>
        </CardContent>
        {!incident.isRead && (
          <div
            className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-background"
            title="Unread Incident"
          ></div>
        )}
        {/* New Status Ribbon */}
        <div
          className={cn(
            "absolute -right-16 bottom-4 w-48 text-center transform rotate-[-45deg] py-1 text-sm font-bold uppercase text-white shadow-lg",
            getRibbonColorForStatus(incident.status)
          )}
        >
          {incident.status.replace("_", " ")}
        </div>
      </Card>
    </Link>
  );
}

export default function IncidentsList({
  incidents,
}: {
  incidents: (Incident & { isRead: boolean; assignee: User | null })[];
}) {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <IncidentSkeleton />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {incidents.map((incident) => (
        <IncidentItem key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
