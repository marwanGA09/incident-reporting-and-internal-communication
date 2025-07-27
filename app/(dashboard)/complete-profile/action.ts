"use server";

import { clerkClient } from "@/lib/clerkClient";
import { auth } from "@clerk/nextjs/server";

type MetadataInput = {
  role: "admin" | "regular";
  position: "higher" | "middle" | "lower";
  departmentId: string;
};

export async function setUserMetadata({
  role,
  position,
  departmentId,
}: MetadataInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await clerkClient.users.updateUser(userId, {
    publicMetadata: { role, position, departmentId },
  });
}
