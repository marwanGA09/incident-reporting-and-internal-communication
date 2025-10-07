import { clerkClient } from "./clerkClient";
import { prisma } from "@/app/lib/prisma";

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
    console.log("Starting user synchronization from Clerk to database...");

    // Fetch all users from Clerk
    const { data: clerkUsers, totalCount } =
      await clerkClient.users.getUserList({
        limit: 500, // Fetch in batches of up to 500 users
      });

    console.log(
      `Found ${totalCount} users in Clerk (received ${clerkUsers.length} in first batch)`
    );

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
        console.log(
          `Created user: ${clerkUser.firstName} ${clerkUser.lastName} (ID: ${clerkUser.id})`
        );
      } else {
        console.log(
          `User already exists: ${clerkUser.firstName} ${clerkUser.lastName} (ID: ${clerkUser.id})`
        );
      }
    }

    console.log(
      `Successfully synchronized users. ${createdCount} users created out of ${totalCount} total users.`
    );
    return { created: createdCount, total: totalCount };
  } catch (error) {
    console.error("Error synchronizing users from Clerk to database:", error);
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
    console.log(
      "Starting user synchronization from Clerk to database (with pagination)..."
    );

    let totalProcessed = 0;
    let totalCreated = 0;
    let offset = 0;
    const limit = 500;

    // Process users in batches to handle large user counts
    while (true) {
      const { data: clerkUsers, totalCount } =
        await clerkClient.users.getUserList({
          limit: limit,
          offset: offset,
        });

      console.log(
        `Fetched batch: ${clerkUsers.length} users (offset: ${offset})`
      );

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
          console.log(
            `Created user: ${clerkUser.firstName} ${clerkUser.lastName} (ID: ${clerkUser.id})`
          );
        } else {
          console.log(
            `User already exists: ${clerkUser.firstName} ${clerkUser.lastName} (ID: ${clerkUser.id})`
          );
        }

        totalProcessed++;
      }

      // If we've processed all users, break the loop
      if (clerkUsers.length < limit) {
        console.log(`Completed sync: Processed all ${totalProcessed} users`);
        break;
      }

      // Move to the next batch
      offset += limit;
    }

    console.log(
      `Successfully synchronized all users. ${totalCreated} users created out of ${totalProcessed} total users.`
    );
    return { created: totalCreated, total: totalProcessed };
  } catch (error) {
    console.error("Error synchronizing users from Clerk to database:", error);
    throw new Error(`Failed to synchronize users: ${error}`);
  }
}
