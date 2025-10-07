import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Clear existing incident-related data (preserving users and departments)
    await prisma.incidentStatusNote.deleteMany({});
    await prisma.incident.deleteMany({});
    await prisma.userIncidentReadStatus.deleteMany({});
    await prisma.attachment.deleteMany({});

    // Get existing Departments (if they exist, otherwise create them)
    let existingDepartments = await prisma.department.findMany();
    
    if (existingDepartments.length === 0) {
      // Create Departments if they don't exist
      const departments = [
        { name: 'Branch of News' },
        { name: 'Department of Educational Program' },
        { name: 'Department of Entertainment Program' },
        { name: 'Human Resource & Training' },
        { name: 'Service of Plan, Research & Budget' },
        { name: 'Law Affair Service' },
        { name: 'Department of Market & Promotion' },
        { name: 'Auditor' },
        { name: 'System Administration' },
        { name: 'ICT Service' },
        { name: 'Maintenance' },
        { name: 'Television Broadcasting' },
        { name: 'Radio Broadcasting' },
      ];

      for (const dept of departments) {
        const createdDept = await prisma.department.create({
          data: dept,
        });
        existingDepartments.push(createdDept);
        console.log(`Created department: ${dept.name}`);
      }
    } else {
      console.log(`Found ${existingDepartments.length} existing departments`);
    }

    // Get existing Incident Categories (if they exist, otherwise create them)
    let existingCategories = await prisma.incidentCategory.findMany();
    
    if (existingCategories.length === 0) {
      // Create Incident Categories if they don't exist
      const categories = [
        { name: 'Broadcast Disruption', description: 'Live feed or programming interruption' },
        { name: 'Equipment Failure', description: 'Broken or malfunctioning broadcasting equipment' },
        { name: 'Content Issue', description: 'Problem with program content or quality' },
        { name: 'Technical Infrastructure', description: 'System or network infrastructure problems' },
        { name: 'Security Concern', description: 'Safety or security threats to staff or facilities' },
        { name: 'Personnel', description: 'Staffing issues, conflicts, or HR matters' },
        { name: 'Regulatory Compliance', description: 'Issues related to broadcasting regulations' },
        { name: 'External Relations', description: 'Matters involving external partners or public relations' },
      ];

      for (const category of categories) {
        const createdCat = await prisma.incidentCategory.create({
          data: category,
        });
        existingCategories.push(createdCat);
        console.log(`Created category: ${category.name}`);
      }
    } else {
      console.log(`Found ${existingCategories.length} existing categories`);
    }

    // Get all existing users
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      throw new Error('No users found in the database. Please ensure at least one user exists.');
    }
    console.log(`Found ${users.length} existing users`);

    // Generate incidents for each department
    for (const dept of existingDepartments) {
      console.log(`Creating incidents for department: ${dept.name}`);
      
      // Create 5 incidents per department
      for (let i = 0; i < 5; i++) {
        // Random dates for occurredAt (in the past few weeks)
        const occurredAt = faker.date.recent({ days: 30 });
        const createdAt = faker.date.between({ from: occurredAt, to: new Date() });
        
        // Select random reporter from all users
        const reporter = users[Math.floor(Math.random() * users.length)];
        
        // Select random assignee (possibly different from reporter)
        const assignee = users[Math.floor(Math.random() * users.length)];
        
        // Select random category
        const category = existingCategories[Math.floor(Math.random() * existingCategories.length)];
        
        // Select random severity and priority
        const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        const priorities = ['URGENT', 'HIGH', 'NORMAL', 'LOW'];
        const severity = severities[Math.floor(Math.random() * severities.length)] as any;
        const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;

        // Generate realistic incident titles and descriptions based on department
        const incidentDetails = generateIncidentDetails(dept.name, category.name);
        
        const incident = await prisma.incident.create({
          data: {
            title: incidentDetails.title,
            description: incidentDetails.description,
            occurredAt,
            createdAt,
            status: 'REPORTED', // Will be updated through status notes
            severity: severity,
            priority: priority,
            departmentId: dept.id,
            categoryId: category.id,
            reporterId: reporter.id,
            assigneeId: assignee.id,
          },
        });

        console.log(`Created incident: ${incident.title} in ${dept.name}`);

        // Create status notes to transition through different statuses
        await createStatusNotes(incident.id, occurredAt);
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate realistic incident details based on department
function generateIncidentDetails(departmentName: string, categoryName: string) {
  const departmentSpecificTitles = {
    'Branch of News': [
      'Live news feed interruption',
      'News reporter safety concern',
      'Breaking news coverage delay',
      'Studio equipment malfunction during broadcast',
      'Source verification issue for story',
    ],
    'Department of Educational Program': [
      'Educational content quality issue',
      'Curriculum development delay',
      'Educational program not reaching target audience',
      'Learning material accessibility problem',
      'Educational program schedule conflict',
    ],
    'Department of Entertainment Program': [
      'Entertainment show delayed',
      'Talent contract dispute',
      'Entertainment content inappropriate for audience',
      'Entertainment program low viewership',
      'Technical issue with entertainment broadcast',
    ],
    'Human Resource & Training': [
      'Workplace harassment complaint',
      'Training schedule conflict',
      'Employee performance issue',
      'Staffing shortage',
      'Training material outdated',
    ],
    'Service of Plan, Research & Budget': [
      'Budget allocation discrepancy',
      'Research data inconsistency',
      'Planning deadline missed',
      'Budget overspending concern',
      'Research methodology issue',
    ],
    'Law Affair Service': [
      'Legal compliance issue',
      'Contract dispute',
      'Copyright infringement concern',
      'Regulatory requirement violation',
      'Legal advice needed urgently',
    ],
    'Department of Market & Promotion': [
      'Marketing campaign underperforming',
      'Promotion material delayed',
      'Target audience not responding',
      'Sponsorship agreement issue',
      'Market research accuracy question',
    ],
    'Auditor': [
      'Financial record discrepancy',
      'Audit deadline approaching',
      'Compliance documentation missing',
      'Internal audit finding',
      'External audit preparation issue',
    ],
    'System Administration': [
      'Server downtime affecting operations',
      'Network connectivity issues',
      'System access rights problem',
      'Backup system failure',
      'System performance degradation',
    ],
    'ICT Service': [
      'Computer system crash',
      'Software licensing issue',
      'Network security concern',
      'Internet connectivity outage',
      'Email system malfunction',
    ],
    'Maintenance': [
      'Equipment maintenance overdue',
      'Building maintenance issue',
      'HVAC system malfunction',
      'Electrical system problem',
      'Facility safety hazard',
    ],
    'Television Broadcasting': [
      'TV broadcast signal interrupted',
      'Studio lighting equipment failure',
      'Video editing software malfunction',
      'Camera equipment issue',
      'Audio mixing problem',
    ],
    'Radio Broadcasting': [
      'Radio broadcast signal interference',
      'Microphone equipment failure',
      'Audio recording quality issue',
      'Radio transmission power problem',
      'Studio monitoring system issue',
    ],
  };

  const titles = departmentSpecificTitles[departmentName as keyof typeof departmentSpecificTitles] || [
    'General operational issue',
    'Equipment malfunction',
    'Process delay',
    'Quality concern',
    'Safety hazard',
  ];

  const descriptions = {
    'Broadcast Disruption': 'Live feed or programming experienced interruption requiring immediate attention.',
    'Equipment Failure': 'Hardware or equipment malfunction affecting operations that needs repair or replacement.',
    'Content Issue': 'Problem with program content or quality that requires review and correction.',
    'Technical Infrastructure': 'System or network infrastructure failure affecting services that requires technical expertise to resolve.',
    'Security Concern': 'Safety or security threat to staff or facilities that poses risk to personnel or operations.',
    'Personnel': 'Workplace conflict, misconduct, or personnel issue that requires management attention.',
    'Regulatory Compliance': 'Issue related to broadcasting regulations that requires compliance review.',
    'External Relations': 'Matter involving external partners or public relations that needs coordination.',
  };

  return {
    title: faker.helpers.arrayElement(titles),
    description: descriptions[categoryName as keyof typeof descriptions] || 'An incident has occurred that requires investigation and resolution.',
  };
}

// Helper function to create status notes with different dates and statuses
async function createStatusNotes(incidentId: string, occurredAt: Date) {
  const statusOrder = [
    'REPORTED',
    'ACKNOWLEDGED', 
    'INVESTIGATING',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
  ];

  // Randomly decide how many status transitions to create (between 2-4)
  const numTransitions = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < numTransitions; i++) {
    // Create a date that progresses from the occurredAt date
    const changedAt = new Date(occurredAt);
    changedAt.setDate(changedAt.getDate() + i + 1); // Add days for progression
    
    const status = statusOrder[i] || statusOrder[statusOrder.length - 1];
    
    await prisma.incidentStatusNote.create({
      data: {
        incidentId,
        status: status,
        note: faker.lorem.sentences(1, ' '),
        changedAt,
        // Using a random clerkId for the changedBy field
        changedById: faker.string.uuid(),
      },
    });

    console.log(`Created status note: ${status} for incident ${incidentId}`);
  }
}

seedDatabase()
  .then(() => console.log('Seeding completed'))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });