// app/(dashboard)/chat/[userId]/page.tsx
import logger from "@/app/lib/logger";
import DirectChat from "./DirectChat";
import { clerkClient } from "@/lib/clerkClient";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  logger.info("Direct chat page loaded", (await params).userId);
  console.log("Direct chat page loaded", (await params).userId);

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
    console.log({ targetUser });
  } catch (error) {
    console.error("Error fetching target user:", error);
  }
  if (!targetUser) {
    return <div className="p-6">User not found</div>;
  }
  return (
    <div className="p-6">
      <DirectChat targetUser={targetUser} />
    </div>
  );
}
