import { prisma } from "@/app/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import IncidentDetail from "../_components/IncidentDetail";
import { clerkClient } from "@/lib/clerkClient";
import { MoveLeftIcon } from "lucide-react";
import Link from "next/link";
export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/");

  const incident = await prisma.incident.findUnique({
    where: { id: (await params).incidentId },
    include: {
      category: true,
      department: true,
      statusNotes: {
        orderBy: { changedAt: "desc" },
      },
    },
  });

  if (!incident) {
    redirect("/incidents");
  }

  // Collect Clerk user IDs to resolve (assignedToId and changedById for statusNotes)
  const clerkUserIds = new Set<string>();
  if (incident.assignedToId) clerkUserIds.add(incident.assignedToId);
  incident.statusNotes.forEach((note) => {
    if (note.changedById) clerkUserIds.add(note.changedById);
  });

  let clerkUsersMap: Record<string, { name: string; email: string }> = {};
  if (clerkUserIds.size > 0) {
    const { data: users } = await clerkClient.users.getUserList({
      userId: Array.from(clerkUserIds),
    });

    clerkUsersMap = Object.fromEntries(
      users.map((u) => [
        u.id,
        {
          name: u.fullName ?? "Unknown",
          email: u.primaryEmailAddress?.emailAddress ?? "N/A",
        },
      ])
    );
  }

  return (
    <div className="container py-8">
      <Link className="flex gap-2 pb-4 pl-8" href="/incidents">
        <MoveLeftIcon /> <span>Back to Incidents</span>
      </Link>
      <IncidentDetail incident={incident} clerkUsersMap={clerkUsersMap} />
    </div>
  );
}
