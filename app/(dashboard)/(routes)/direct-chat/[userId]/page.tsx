// app/(dashboard)/chat/[userId]/page.tsx
import logger from "@/app/lib/logger";
import DirectChat from "./DirectChat";
import { clerkClient } from "@/lib/clerkClient";
import { markNotificationsAsRead } from "@/app/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  logger.info("Direct chat page loaded");

  let targetUser;
  try {
    const responseObj = await clerkClient.users.getUser((await params).userId);
    targetUser = {
      name: responseObj?.firstName || "",
      id: responseObj.id,
      imageUrl: responseObj.imageUrl || "",
      username: responseObj.username || "",
      email: responseObj.primaryEmailAddress?.emailAddress || "",
    };
  } catch (error) {
    logger.error({ error }, "Error fetching target user:");
  }
  if (!targetUser) {
    return <div className="p-6">User not found</div>;
  }
  const url = `/direct-chat/${targetUser.id}`;
  markNotificationsAsRead(url);

  return (
    <div className="p-6">
      <DirectChat targetUser={targetUser} />
    </div>
  );
}
