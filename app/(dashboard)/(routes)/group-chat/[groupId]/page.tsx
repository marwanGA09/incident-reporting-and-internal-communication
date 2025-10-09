import { getGroupMembers } from "@/app/lib/actions";
import GroupChat from "./GroupChat";
import { prisma } from "@/app/lib/prisma";

async function page({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const department = await prisma.department.findUnique({
    where: { id: groupId },
  });

  if (!department) {
    return <div>Department not found.</div>;
  }

  const usersFromDb = await getGroupMembers(groupId);
  const users = usersFromDb.map((user) => {
    return {
      name: user.firstName || user.username || "",
      id: user.clerkId!,
      imageUrl: user.imageUrl || "",
      username: user.username || "",
      email: user.email || "",
    };
  });

  return (
    <div className="p-6 w-full h-full">
      <div className="w-full max-w-5xl h-full">
        <GroupChat department={department} users={users} />
      </div>
    </div>
  );
}

export default page;
