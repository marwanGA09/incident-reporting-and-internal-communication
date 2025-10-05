// app/(dashboard)/(routes)/group-chat/[groupId]/GroupMembers.tsx
import { useEffect, useState } from "react";
import { getGroupMembers } from "@/app/lib/actions";
import usePresence from "@/hooks/use-presence";
import { User, UserPresence } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/time-ago";

interface GroupMembersProps {
  groupId: string;
}

type UserWithPresence = User & { presence: UserPresence | null };

const GroupMembers = ({ groupId }: GroupMembersProps) => {
  const [members, setMembers] = useState<UserWithPresence[]>([]);
  const { onlineUsers } = usePresence(`group-${groupId}`);

  useEffect(() => {
    const fetchMembers = async () => {
      const groupMembers = await getGroupMembers(groupId);
      setMembers(groupMembers as UserWithPresence[]);
    };
    fetchMembers();
  }, [groupId]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Group Members</h2>
      <ul className="space-y-2">
        {members.map((member) => {
          const isOnline = onlineUsers.includes(member.clerkId!);
          return (
            <li key={member.id} className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={member.imageUrl || ""} />
                <AvatarFallback>
                  {member.firstName?.[0]}
                  {member.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{member.username}</span>
                <span className="text-xs text-gray-500">
                  {isOnline
                    ? "Online"
                    : member.presence
                    ? formatTimeAgo(new Date(member.presence.lastSeen))
                    : "Offline"}
                </span>
              </div>
              <span
                className={`ml-auto h-2 w-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GroupMembers;
