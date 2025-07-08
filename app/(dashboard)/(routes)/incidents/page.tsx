import { prisma } from "@/app/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";

import { redirect } from "next/navigation";
import IncidentsList from "./_components/IncidentsList";

export default async function IncidentsPage() {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/");
  }

  const currentUserRole = user.publicMetadata.role;
  const currentUserDepId = user.publicMetadata.departmentId;

  let incidents;
  if (currentUserRole === "admin") {
    incidents = await prisma.incident.findMany({
      include: { category: true, department: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    incidents = await prisma.incident.findMany({
      where: {
        departmentId: String(currentUserDepId),
      },
      include: { category: true, department: true },
      orderBy: { createdAt: "desc" },
    });
  }
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const { data, totalCount } = await clerkClient.users.getUserList({
    orderBy: "-created_at",
    limit: 500,
  });

  const users = data
    .filter((user) => user.publicMetadata.departmentId === currentUserDepId)
    .map((user) => {
      return { name: user?.fullName || "", id: user.id };
    });
  console.log({ users });

  // const onAssignUser = async (incidentId: string, userId: string) => {
  //   await prisma.incident.update({
  //     where: {
  //       id: incidentId,
  //     },
  //     data: {
  //       assignedToId: userId,
  //     },
  //   });
  // };
  return (
    <div className="container p-8">
      <h1 className="text-3xl font-bold mb-6">Incident Reports</h1>
      <IncidentsList incidents={incidents} users={users} />
    </div>
  );
}
