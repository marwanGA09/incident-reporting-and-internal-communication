import { clerkClient } from "./clerkClient";
import { prisma } from "@/app/lib/prisma";
import logger from "@/app/lib/logger";

/**
 * Synchronizes all users from Clerk to the database.
 * This function fetches all users from Clerk and creates them in the database if they don't exist.
 * It checks for existing users by their clerkId to avoid duplicates.
 */
export async function syncClerkUsers(): Promise<{
  created: number;
  total: number;
}> {
  try {
    // Fetch all users from Clerk
    const { data: clerkUsers, totalCount } =
      await clerkClient.users.getUserList({
        limit: 500, // Fetch in batches of up to 500 users
      });

    let createdCount = 0;

    // Process each Clerk user
    for (const clerkUser of clerkUsers) {
      // Check if user already exists in the database
      const existingUser = await prisma.user.findUnique({
        where: {
          clerkId: clerkUser.id,
        },
      });

      if (!existingUser) {
        // User doesn't exist, create a new user in the database
        await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            username: clerkUser.username || undefined,
            imageUrl: clerkUser.imageUrl || undefined,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || undefined,
            role: (clerkUser.publicMetadata.role as string) || "user",
            position: (clerkUser.publicMetadata.position as string) || "lower",
            departmentId:
              (clerkUser.publicMetadata.departmentId as string) || undefined,
          },
        });

        createdCount++;
      } else {
      }
    }

    return { created: createdCount, total: totalCount };
  } catch (error) {
    logger.error(
      { error },
      "Error synchronizing users from Clerk to database:"
    );
    throw new Error(`Failed to synchronize users: ${error}`);
  }
}

/**
 * Synchronizes all users from Clerk to the database with pagination support.
 * This function fetches all users from Clerk in batches and creates them in the database if they don't exist.
 */
export async function syncClerkUsersWithPagination(): Promise<{
  created: number;
  total: number;
}> {
  try {
    let totalProcessed = 0;
    let totalCreated = 0;
    let offset = 0;
    const limit = 500;

    // Process users in batches to handle large user counts
    while (true) {
      const { data: clerkUsers } = await clerkClient.users.getUserList({
        limit: limit,
        offset: offset,
      });

      // Process each Clerk user in the current batch
      for (const clerkUser of clerkUsers) {
        // Check if user already exists in the database
        const existingUser = await prisma.user.findUnique({
          where: {
            clerkId: clerkUser.id,
          },
        });

        if (!existingUser) {
          // User doesn't exist, create a new user in the database
          await prisma.user.create({
            data: {
              clerkId: clerkUser.id,
              firstName: clerkUser.firstName || undefined,
              lastName: clerkUser.lastName || undefined,
              username: clerkUser.username || undefined,
              imageUrl: clerkUser.imageUrl || undefined,
              email: clerkUser.emailAddresses?.[0]?.emailAddress || undefined,
              role: (clerkUser.publicMetadata.role as string) || "user",
              position:
                (clerkUser.publicMetadata.position as string) || "lower",
              departmentId:
                (clerkUser.publicMetadata.departmentId as string) || undefined,
            },
          });

          totalCreated++;
        } else {
        }

        totalProcessed++;
      }

      // If we've processed all users, break the loop
      if (clerkUsers.length < limit) {
        break;
      }

      // Move to the next batch
      offset += limit;
    }

    return { created: totalCreated, total: totalProcessed };
  } catch (error) {
    logger.error({ error }, "Error synchronizing users from Clerk to database");
    throw new Error(`Failed to synchronize users: ${error}`);
  }
}
