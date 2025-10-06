"use server";

import { clerkClient } from "@/lib/clerkClient";
import { auth } from "@clerk/nextjs/server";
import logger from "@/app/lib/logger";

type MetadataInput = {
  role: "admin" | "user";
  position: "higher" | "middle" | "lower";
  departmentId: string;
};

export async function setUserMetadata({
  role,
  position,
  departmentId,
}: MetadataInput) {
  const { userId } = await auth();
  if (!userId) {
    logger.error("setUserMetadata: Unauthenticated user attempted to set metadata.");
    throw new Error("Not authenticated");
  }

  logger.info(
    { userId, role, position, departmentId },
    "setUserMetadata: Attempting to update user metadata."
  );

  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role, position, departmentId },
    });

    logger.info(
      { userId, role, position, departmentId },
      "setUserMetadata: Successfully updated user metadata."
    );
  } catch (error) {
    logger.error(
      { userId, error },
      "setUserMetadata: Failed to update user metadata."
    );
    // Re-throw the error to be handled by the global error boundary
    throw error;
  }
}
