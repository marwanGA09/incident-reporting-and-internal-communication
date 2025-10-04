import { prisma } from "@/app/lib/prisma";
import PageFourForm from "../_components/PageFourForm";

export default async function Step4() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      departmentId: true,
    },
    orderBy: { firstName: "asc" },
  });

  const formattedUsers = users.map((user) => ({
    id: user.id,
    name: `${user.firstName || ""} ${user.lastName || ""} (${user.email})`,
    position: user.position,
    departmentId: user.departmentId,
  }));

  return <PageFourForm departments={departments} users={formattedUsers} />;
}
