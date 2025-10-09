import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import IncidentsList from "./_components/IncidentsList";
import { Button } from "@/components/ui/button";
import { IncidentControls } from "./_components/IncidentControls";

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; sortBy?: string }>;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const currentUserDb = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, role: true, departmentId: true },
  });

  if (!currentUserDb) {
    redirect("/");
  }

  const query = (await searchParams)?.query || "";
  const sortBy = (await searchParams)?.sortBy || "newest";

  const whereClause: Prisma.IncidentWhereInput = {
    title: {
      contains: query,
      mode: "insensitive",
    },
  };

  if (currentUserDb.role !== "admin") {
    if (currentUserDb.departmentId) {
      whereClause.departmentId = currentUserDb.departmentId;
    } else {
      // If a non-admin user has no department, they should not see any incidents.
      // Set a condition that will result in no incidents being found.
      whereClause.id = { in: [] }; // This ensures no incidents are returned.
    }
  }

  let orderByClause: Prisma.IncidentOrderByWithRelationInput = {
    createdAt: "desc",
  };
  if (sortBy === "oldest") {
    orderByClause = { createdAt: "asc" };
  }
  if (sortBy === "severity") {
    orderByClause = { severity: "asc" }; // CRITICAL is first alphabetically
  }
  if (sortBy === "priority") {
    orderByClause = { priority: "asc" }; // URGENT is first alphabetically
  }

  const incidents = await prisma.incident.findMany({
    where: whereClause,
    include: {
      category: true,
      department: true,
      assignee: true,
    },
    orderBy: orderByClause,
  });

  const readIncidentStatuses = await prisma.userIncidentReadStatus.findMany({
    where: { userId: currentUserDb.id },
    select: { incidentId: true },
  });

  const readIncidentIds = new Set(
    readIncidentStatuses.map((status) => status.incidentId)
  );

  const incidentsWithReadStatus = incidents.map((incident) => ({
    ...incident,
    isRead: readIncidentIds.has(incident.id),
  }));

  return (
    <div className="p-6">
      {/* New Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Incident Reports</h1>
          <p className="text-muted-foreground">
            A list of all incidents in your organization.
          </p>
        </div>
        <Link href="/incidents/new/step-1">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Report New Incident
          </Button>
        </Link>
      </div>

      {/* Search and Sort Controls */}
      <IncidentControls />

      {/* Incident List */}
      <IncidentsList incidents={incidentsWithReadStatus} />
    </div>
  );
}
