import { syncClerkUsers, syncClerkUsersWithPagination } from '../lib/syncClerkUsers';

/**
 * Example usage of the Clerk user sync functions
 */
async function exampleUsage() {
  console.log('Starting Clerk user synchronization example...');

  try {
    // Option 1: Sync with default batch (good for smaller user counts)
    console.log('\n--- Using default sync (up to 500 users) ---');
    const result1 = await syncClerkUsers();
    console.log(`Sync result: ${result1.created} users created out of ${result1.total} total users`);

    // Option 2: Sync with pagination support (good for larger user counts)
    console.log('\n--- Using paginated sync (for large user counts) ---');
    const result2 = await syncClerkUsersWithPagination();
    console.log(`Sync result: ${result2.created} users created out of ${result2.total} total users`);

  } catch (error) {
    console.error('Error during user synchronization:', error);
  }
}

// This allows the function to be called directly when this file is run
if (require.main === module) {
  exampleUsage().catch(console.error);
}

export { syncClerkUsers, syncClerkUsersWithPagination };