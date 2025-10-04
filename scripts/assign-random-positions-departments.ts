import { prisma } from '@/app/lib/prisma';

/**
 * Assigns random positions and departments to all users in the database.
 * This function will update all existing users with:
 * - A random position (higher, middle, or lower)
 * - A random department ID from the existing departments
 */
export async function assignRandomPositionsAndDepartments(): Promise<{ updated: number }> {
  try {
    console.log('Starting assignment of random positions and departments to all users...');
    
    // Fetch all users from the database
    const users = await prisma.user.findMany();
    
    // Fetch all departments to randomly assign
    const departments = await prisma.department.findMany();
    
    if (departments.length === 0) {
      throw new Error('No departments found in the database. Please create at least one department first.');
    }

    console.log(`Found ${users.length} users and ${departments.length} departments in the database`);
    
    let updatedCount = 0;

    // Possible positions
    const positions: ['higher', 'middle', 'lower'] = ['higher', 'middle', 'lower'];
    
    // Process each user
    for (const user of users) {
      // Select a random position
      const randomPosition = positions[Math.floor(Math.random() * positions.length)];
      
      // Select a random department
      const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
      
      // Update the user with random position and department
      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          position: randomPosition,
          departmentId: randomDepartment.id
        }
      });
      
      updatedCount++;
      console.log(`Updated user: ${user.firstName} ${user.lastName} (ID: ${user.id}) - Position: ${randomPosition}, Department: ${randomDepartment.name}`);
    }

    console.log(`Successfully updated ${updatedCount} users with random positions and departments.`);
    return { updated: updatedCount };
  } catch (error) {
    console.error('Error assigning random positions and departments:', error);
    throw new Error(`Failed to assign random positions and departments: ${error}`);
  }
}

// This allows the function to be run directly when this file is executed
if (require.main === module) {
  import('@/app/lib/prisma').then(() => {
    assignRandomPositionsAndDepartments()
      .then(result => {
        console.log(`\nAssignment completed successfully! ${result.updated} users updated.`);
        process.exit(0);
      })
      .catch(error => {
        console.error('Assignment failed:', error);
        process.exit(1);
      });
  });
}