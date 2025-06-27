import { prisma } from "@/app/lib/prisma";
import CompleteMetadataForm from "@/app/(dashboard)/complete-profile/_components/CompleteMetadataForm";

export default async function CompleteProfilePage() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
  });
  return <CompleteMetadataForm departments={departments} />;
}
