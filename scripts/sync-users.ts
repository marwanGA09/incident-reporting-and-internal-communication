#!/usr/bin/env node

import { syncClerkUsersWithPagination } from '../lib/syncClerkUsers';

/**
 * Script to sync users from Clerk to the database
 * Run this script manually when you need to sync users
 * 
 * Usage:
 *   pnpm tsx scripts/sync-users.ts
 */
async function main() {
  console.log('Starting Clerk user synchronization...');
  
  try {
    const result = await syncClerkUsersWithPagination();
    console.log('\nSynchronization completed successfully!');
    console.log(`Created: ${result.created} users`);
    console.log(`Total processed: ${result.total} users`);
  } catch (error) {
    console.error('Synchronization failed:', error);
    process.exit(1);
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  main();
}

export { main as syncUsers };