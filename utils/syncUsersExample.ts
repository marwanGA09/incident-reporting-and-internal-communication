import { syncClerkUsers, syncClerkUsersWithPagination } from '../lib/syncClerkUsers';
import logger from '../app/lib/logger';

/**
 * Example usage of the Clerk user sync functions
 */
async function exampleUsage() {
  

  try {
    // Option 1: Sync with default batch (good for smaller user counts)
    
    const result1 = await syncClerkUsers();
    

    // Option 2: Sync with pagination support (good for larger user counts)
    
    const result2 = await syncClerkUsersWithPagination();
    

  } catch (error) {
    logger.error('Error during user synchronization:', error);
  }
}

// This allows the function to be called directly when this file is run
if (require.main === module) {
  exampleUsage().catch(logger.error);
}

export { syncClerkUsers, syncClerkUsersWithPagination };