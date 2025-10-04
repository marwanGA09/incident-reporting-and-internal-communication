import { prisma } from "@/app/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar as CalendarIcon,
  Clock,
  Flame,
  Minus,
  MoveLeftIcon,
  ShieldAlert,
  Siren,
  User as UserIcon,
  Building,
  Tag,
} from "lucide-react";

import { markIncidentAsRead } from "@/app/lib/actions";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariantForStatus } from "@/lib/getBadgeVariantForStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import IncidentInteraction from "../_components/IncidentInteraction";

// Helper to get icon and label for priority
const getPriorityProps = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return { icon: <Flame className="h-4 w-4" />, label: "Urgent" };
    case "HIGH":
      return { icon: <ArrowUp className="h-4 w-4" />, label: "High" };
    case "NORMAL":
      return { icon: <Minus className="h-4 w-4" />, label: "Normal" };
    case "LOW":
      return { icon: <ArrowDown className="h-4 w-4" />, label: "Low" };
    default:
      return { icon: null, label: priority };
  }
};

// Helper to get color and icon for severity
const getSeverityProps = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return { icon: <Siren className="h-5 w-5" />, color: "text-red-500" };
    case "HIGH":
      return {
        icon: <ShieldAlert className="h-5 w-5" />,
        color: "text-orange-500",
      };
    case "MEDIUM":
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "text-yellow-500",
      };
    default:
      return { icon: null, color: "text-gray-500" };
  }
};

export default async function IncidentDetailPage({
  params,
}: {
  params: { incidentId: string };
}) {
  const user = await currentUser();
  if (!user) redirect("/");

  await markIncidentAsRead(params.incidentId);

  const incident = await prisma.incident.findUnique({
    where: { id: params.incidentId },
    include: {
      category: true,
      department: true,
      reporter: true,
      assignee: true,
      statusNotes: {
        orderBy: { changedAt: "asc" },
      },
    },
  });

  if (!incident) {
    redirect("/incidents");
  }

  const departmentUsers = await prisma.user.findMany({
    where: { departmentId: incident.departmentId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      username: true,
      email: true,
    },
  });

  const severityProps = getSeverityProps(incident.severity);
  const priorityProps = getPriorityProps(incident.priority);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link
        href="/incidents"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
      >
        <MoveLeftIcon className="h-4 w-4" />
        <span>Back to All Incidents</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              INC-{String(incident.incidentNumber).padStart(5, "0")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {incident.title}
            </h1>
            <p className="text-muted-foreground">{incident.description}</p>
          </div>

          {/* Status & Vitals */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard
              title="Status"
              content={
                <Badge
                  variant={getBadgeVariantForStatus(incident.status)}
                  className="text-sm capitalize"
                >
                  {incident.status.replace("_", " ").toLowerCase()}
                </Badge>
              }
            />
            <InfoCard
              title="Severity"
              content={incident.severity}
              icon={severityProps.icon}
              className={severityProps.color}
            />
            <InfoCard
              title="Priority"
              content={priorityProps.label}
              icon={priorityProps.icon}
            />
          </div>

          {/* Status Notes Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {incident.statusNotes.map((note, index) => (
                  <div key={note.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-primary rounded-full" />
                      {index < incident.statusNotes.length - 1 && (
                        <div className="w-px h-full bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-semibold">
                        Status changed to "
                        <span className="capitalize">
                          {note.status.replace("_", " ").toLowerCase()}
                        </span>
                        "
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(note.changedAt), "PPP p")}
                      </p>
                      <p className="mt-2 text-sm bg-muted p-3 rounded-md">
                        {note.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Metadata) */}
        <div className="space-y-6">
          <IncidentInteraction
            incident={incident}
            departmentUsers={departmentUsers}
          />
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetadataItem
                icon={<UserIcon className="h-4 w-4" />}
                label="Reporter"
                value={`${incident.reporter.firstName || ""} ${
                  incident.reporter.username || ""
                }`.trim()}
              />
              <MetadataItem
                icon={<UserIcon className="h-4 w-4" />}
                label="Assignee"
                value={
                  incident.assignee
                    ? `${incident.assignee.firstName || ""} ${
                        incident.assignee.username || ""
                      }`.trim()
                    : "Unassigned"
                }
              />
              <Separator />
              <MetadataItem
                icon={<Building className="h-4 w-4" />}
                label="Department"
                value={incident.department.name}
              />
              <MetadataItem
                icon={<Tag className="h-4 w-4" />}
                label="Category"
                value={incident.category.name}
              />
              <Separator />
              <MetadataItem
                icon={<Clock className="h-4 w-4" />}
                label="Occurred At"
                value={format(new Date(incident.occurredAt), "PPP p")}
              />
              <MetadataItem
                icon={<CalendarIcon className="h-4 w-4" />}
                label="Created At"
                value={format(new Date(incident.createdAt), "PPP p")}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  content,
  icon,
  className,
}: {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className="flex flex-col justify-center p-4">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div
        className={cn("text-xl font-bold flex items-center gap-2", className)}
      >
        {icon}
        <span>{content}</span>
      </div>
    </Card>
  );
}

function MetadataItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold text-right">{value}</span>
    </div>
  );
}
