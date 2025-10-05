// app/(dashboard)/(routes)/group-chat/[groupId]/GroupMembers.tsx
"use client";

import { useEffect, useState } from "react";
import { getGroupMembers } from "@/app/lib/actions";
import usePresence from "@/hooks/use-presence";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GroupMembersProps {
  groupId: string;
}

const GroupMembers = ({ groupId }: GroupMembersProps) => {
  const [members, setMembers] = useState<User[]>([]);
  const { onlineUsers } = usePresence(`group-${groupId}`);

  useEffect(() => {
    const fetchMembers = async () => {
      const groupMembers = await getGroupMembers(groupId);
      setMembers(groupMembers);
    };
    fetchMembers();
  }, [groupId]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Group Members</h2>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={member.imageUrl || ""} />
              <AvatarFallback>
                {member.firstName?.[0]}
                {member.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span>{member.username}</span>
            <span
              className={`ml-auto h-2 w-2 rounded-full ${
                onlineUsers.includes(member.clerkId!) ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupMembers;
