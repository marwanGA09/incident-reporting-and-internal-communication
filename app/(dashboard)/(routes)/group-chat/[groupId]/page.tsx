import { clerkClient } from "@/lib/clerkClient";
import GroupChat from "./GroupChat";
import logger from "@/app/lib/logger";
import { prisma } from "@/app/lib/prisma";

async function page({ params }: { params: Promise<{ groupId: string }> }) {
  const groupId = (await params).groupId;

  const department = await prisma.department.findUnique({
    where: { id: groupId },
  });

  if (!department) {
    return <div>Department not found.</div>;
  }

  const { data } = await clerkClient.users.getUserList({
    orderBy: "-created_at",
    limit: 500,
  });

  const users = data
    .filter((user) => user.publicMetadata.departmentId === groupId)
    .map((user) => {
      return {
        name: user?.firstName || "",
        id: user.id,
        imageUrl: user.imageUrl || "",
        username: user.username || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      };
    });

  return (
    <div className="w-full h-full flex justify-center p-4 lg:p-6">
      <div className="w-full max-w-5xl h-full">
        <GroupChat department={department} users={users} />
      </div>
    </div>
  );
}

export default page;
