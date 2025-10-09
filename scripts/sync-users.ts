#!/usr/bin/env node

import { syncClerkUsersWithPagination } from "../lib/syncClerkUsers";
import logger from "../app/lib/logger";

/**
 * Script to sync users from Clerk to the database
 * Run this script manually when you need to sync users
 *
 * Usage:
 *   pnpm tsx scripts/sync-users.ts
 */
async function main() {
  try {
    const result = await syncClerkUsersWithPagination();
  } catch (error) {
    logger.error({ error }, "Synchronization failed:");
    process.exit(1);
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  main();
}

export { main as syncUsers };
