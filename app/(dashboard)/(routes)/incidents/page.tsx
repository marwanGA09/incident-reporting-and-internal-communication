// import { prisma } from "@/app/lib/prisma";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// async function page() {
//   // const { userId } = await auth();

//   const user = await currentUser();
//   console.log("jlk", { user });
//   if (!user?.id) {
//     redirect("/");
//   }

//   const currentUserRole = user.publicMetadata.role;
//   const currentUserDepId = user.publicMetadata.departmentId;
//   console.log({ currentUserDepId, currentUserRole });
//   let incidents;
//   if (currentUserRole === "admin") {
//     incidents = await prisma.incident.findMany({});
//   } else {
//     incidents = await prisma.incident.findMany({
//       where: {
//         departmentId: `${currentUserDepId}`,
//       },
//     });
//   }
//   console.log({ incidents });
//   return (
//     <div>
//       <h1>This is incidents page</h1>
//     </div>
//   );
// }

// export default page;
// app/incidents/page.tsx

import { prisma } from "@/app/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import IncidentsList from "./IncidentsList";

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

  return (
    <div className="container p-8">
      <h1 className="text-3xl font-bold mb-6">Incident Reports</h1>
      <IncidentsList incidents={incidents} />
    </div>
  );
}
