import { auth } from "@clerk/nextjs/server";
import IncidentsList from "./_components/IncidentsList";
import { prisma } from "@/app/lib/prisma";
import { clerkClient } from "@/lib/clerkClient";

export default async function IncidentsPage() {
  const { userId: clerkId } = await auth();
  let unreadNotifications: any[] = [];

  if (!clerkId) return null;
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true, departmentId: true },
  });
  if (!user) return null;
  // if (user) {
  unreadNotifications = await prisma.notification.findMany({
    where: {
      recipientId: user.id,
      isRead: false,
      url: {
        startsWith: "/incidents/",
      },
    },
  });
  // }
  const currentUserRole = user?.role;
  const currentUserDepId = user?.departmentId;

  const incidents = await prisma.incident.findMany({
    where:
      currentUserRole === "admin"
        ? {}
        : { departmentId: String(currentUserDepId) },
    include: { category: true, department: true },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });
  // NOTE FOR FUTURE USE FROM DATABASE ITSELF
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
  // }

  // return <IncidentsList  />;
  return (
    <div className="container p-8">
      <h1 className="text-3xl font-bold mb-6">Incident Reports</h1>
      <IncidentsList
        unreadNotifications={unreadNotifications}
        incidents={incidents}
        users={users}
      />
    </div>
  );
}
