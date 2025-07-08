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

  const currentUserRole = user.publicMetadata.role;
  const currentUserDepId = user.publicMetadata.departmentId;

  const incidents = await prisma.incident.findMany({
    where:
      currentUserRole === "admin"
        ? {}
        : { departmentId: String(currentUserDepId) },
    include: { category: true, department: true },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });

  const { data } = await clerkClient.users.getUserList({
    orderBy: "-created_at",
    limit: 500,
  });

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
  console.log({ users });

  return (
    <div className="container p-8">
      <h1 className="text-3xl font-bold mb-6">Incident Reports</h1>
      <IncidentsList incidents={incidents} users={users} />
    </div>
  );
}
