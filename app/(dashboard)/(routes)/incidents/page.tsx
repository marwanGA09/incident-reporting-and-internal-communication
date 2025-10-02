import { prisma } from "@/app/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import IncidentsList from "./_components/IncidentsList";
import { clerkClient } from "@/lib/clerkClient";

export default async function IncidentsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const currentUserDb = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, role: true, departmentId: true },
  });

  if (!currentUserDb) {
    redirect("/"); // Or handle the case where the user is not in your DB
  }

  const currentUserRole = currentUserDb.role;
  const currentUserDepId = currentUserDb.departmentId;

  const readIncidentStatuses = await prisma.userIncidentReadStatus.findMany({
    where: { userId: currentUserDb.id },
    select: { incidentId: true },
  });

  const readIncidentIds = new Set(
    readIncidentStatuses.map((status) => status.incidentId)
  );

  const it = await prisma.incident.findMany();
  console.log("Total incidents in DB:", it.length);

  const incidents = await prisma.incident.findMany({
    where:
      currentUserRole === "admin"
        ? {}
        : { departmentId: String(currentUserDepId) },
    include: { category: true, department: true },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });
  console.log("is admin", currentUserRole, incidents.length);
  const incidentsWithReadStatus = incidents.map((incident) => ({
    ...incident,
    isRead: readIncidentIds.has(incident.id),
  }));

  const { data } = await clerkClient.users.getUserList({
    orderBy: "-created_at",
    limit: 500,
  });
  const totalUnReadIncidents = incidentsWithReadStatus.filter(
    (incident) => !incident.isRead
  ).length;
  console.log({ totalUnReadIncidents });
  const users =
    currentUserRole === "admin"
      ? data.map((user) => {
          return {
            name:
              `${user?.fullName} (${user?.primaryEmailAddress?.emailAddress})` ||
              "",
            id: user.id,
          };
        })
      : data
          .filter(
            (user) => user.publicMetadata.departmentId === currentUserDepId
          )
          .map((user) => {
            return {
              name:
                `${user?.fullName} (${user?.primaryEmailAddress?.emailAddress})` ||
                "",
              id: user.id,
            };
          });

  return (
    <div className="container p-8">
      <h1 className="text-3xl font-bold mb-6">Incident Reports</h1>
      <IncidentsList incidents={incidentsWithReadStatus} users={users} />
    </div>
  );
}
