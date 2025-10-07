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
  File as FileIcon,
  Flame,
  Minus,
  MoveLeftIcon,
  ShieldAlert,
  Siren,
  User as UserIcon,
  Building,
  Tag,
} from "lucide-react";
import Image from "next/image";

import { markIncidentAsRead } from "@/app/lib/actions";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariantForStatus } from "@/lib/getBadgeVariantForStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import IncidentInteraction from "../_components/IncidentInteraction";
import AddAttachment from "../_components/AddAttachment";
import { Attachment } from "@prisma/client";
import { AISummaryCard } from "../_components/AISummaryCard"; // Import the new client component

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

const renderAttachment = (file: Attachment) => {
  const extension = file.fileName?.split(".").pop()?.toLowerCase();

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension!)) {
    return (
      <a href={file.url} target="_blank" rel="noopener noreferrer">
        <Image
          src={file.url}
          alt={file.fileName || "Incident Attachment"}
          width={200}
          height={200}
          className="rounded-lg object-cover h-48 w-full hover:opacity-80 transition-opacity"
        />
      </a>
    );
  }

  if (["mp4", "webm", "mov"].includes(extension!)) {
    return <video src={file.url} controls className="rounded-lg w-full" />;
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center justify-center gap-2 text-center p-2 border rounded-lg h-48 w-full hover:bg-accent"
    >
      <FileIcon className="h-10 w-10 flex-shrink-0" />
      <span className="font-medium text-xs break-all">{file.fileName}</span>
    </a>
  );
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
      attachments: true,
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
    <div className="p-6">
      <Link
        href="/incidents"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
      >
        <MoveLeftIcon className="h-4 w-4" />
        <span>Back to All Incidents</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
            {incident.description && (
              <p className="text-muted-foreground text-base">
                {incident.description}
              </p>
            )}
          </div>

          {/* AI Summary Card (Client Component) */}
          <AISummaryCard incidentId={incident.id} />

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

          {/* Attachments Card */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {incident.attachments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {incident.attachments.map((file) => (
                    <div key={file.id}>{renderAttachment(file)}</div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No attachments for this incident.
                </p>
              )}
              <Separator className="my-6" />
              <AddAttachment incidentId={incident.id} />
            </CardContent>
          </Card>

          {/* Status Notes Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border before:-translate-x-px">
                {incident.statusNotes.map((note) => (
                  <div
                    key={note.id}
                    className="relative flex items-start gap-4"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className="font-semibold">
                        Status changed to{" "}
                        <span className="capitalize font-bold">
                          {note.status.replace("_", " ").toLowerCase()}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
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
        <div className="space-y-6 lg:sticky lg:top-24">
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
                  incident.reporter.lastName || ""
                }`.trim()}
              />
              <MetadataItem
                icon={<UserIcon className="h-4 w-4" />}
                label="Assignee"
                value={
                  incident.assignee
                    ? `${incident.assignee.firstName || ""} ${
                        incident.assignee.lastName || ""
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
