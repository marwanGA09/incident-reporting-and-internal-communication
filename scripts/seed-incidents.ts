import { PrismaClient, User } from "@prisma/client";
import { faker } from "@faker-js/faker";
import logger from "@/app/lib/logger";

const prisma = new PrismaClient();

// Helper function to generate realistic incident details based on department
function generateIncidentDetails(departmentName: string, categoryName: string) {
  const departmentSpecificTitles = {
    "Branch of News": [
      "Live news feed interruption",
      "News reporter safety concern",
      "Breaking news coverage delay",
      "Studio equipment malfunction during broadcast",
      "Source verification issue for story",
    ],
    "Department of Educational Program": [
      "Educational content quality issue",
      "Curriculum development delay",
      "Educational program not reaching target audience",
      "Learning material accessibility problem",
      "Educational program schedule conflict",
    ],
    "Department of Entertainment Program": [
      "Entertainment show delayed",
      "Talent contract dispute",
      "Entertainment content inappropriate for audience",
      "Entertainment program low viewership",
      "Technical issue with entertainment broadcast",
    ],
    "Human Resource & Training": [
      "Workplace harassment complaint",
      "Training schedule conflict",
      "Employee performance issue",
      "Staffing shortage",
      "Training material outdated",
    ],
    "Service of Plan, Research & Budget": [
      "Budget allocation discrepancy",
      "Research data inconsistency",
      "Planning deadline missed",
      "Budget overspending concern",
      "Research methodology issue",
    ],
    "Law Affair Service": [
      "Legal compliance issue",
      "Contract dispute",
      "Copyright infringement concern",
      "Regulatory requirement violation",
      "Legal advice needed urgently",
    ],
    "Department of Market & Promotion": [
      "Marketing campaign underperforming",
      "Promotion material delayed",
      "Target audience not responding",
      "Sponsorship agreement issue",
      "Market research accuracy question",
    ],
    Auditor: [
      "Financial record discrepancy",
      "Audit deadline approaching",
      "Compliance documentation missing",
      "Internal audit finding",
      "External audit preparation issue",
    ],
    "System Administration": [
      "Server downtime affecting operations",
      "Network connectivity issues",
      "System access rights problem",
      "Backup system failure",
      "System performance degradation",
    ],
    "ICT Service": [
      "Computer system crash",
      "Software licensing issue",
      "Network security concern",
      "Internet connectivity outage",
      "Email system malfunction",
    ],
    Maintenance: [
      "Equipment maintenance overdue",
      "Building maintenance issue",
      "HVAC system malfunction",
      "Electrical system problem",
      "Facility safety hazard",
    ],
    "Television Broadcasting": [
      "TV broadcast signal interrupted",
      "Studio lighting equipment failure",
      "Video editing software malfunction",
      "Camera equipment issue",
      "Audio mixing problem",
    ],
    "Radio Broadcasting": [
      "Radio broadcast signal interference",
      "Microphone equipment failure",
      "Audio recording quality issue",
      "Radio transmission power problem",
      "Studio monitoring system issue",
    ],
  };

  const titles = departmentSpecificTitles[
    departmentName as keyof typeof departmentSpecificTitles
  ] || [
    "General operational issue",
    "Equipment malfunction",
    "Process delay",
    "Quality concern",
    "Safety hazard",
  ];

  const descriptions = {
    "Broadcast Disruption":
      "Live feed or programming experienced interruption requiring immediate attention.",
    "Equipment Failure":
      "Hardware or equipment malfunction affecting operations that needs repair or replacement.",
    "Content Issue":
      "Problem with program content or quality that requires review and correction.",
    "Technical Infrastructure":
      "System or network infrastructure failure affecting services that requires technical expertise to resolve.",
    "Security Concern":
      "Safety or security threat to staff or facilities that poses risk to personnel or operations.",
    Personnel:
      "Workplace conflict, misconduct, or personnel issue that requires management attention.",
    "Regulatory Compliance":
      "Issue related to broadcasting regulations that requires compliance review.",
    "External Relations":
      "Matter involving external partners or public relations that needs coordination.",
  };

  return {
    title: faker.helpers.arrayElement(titles),
    description:
      descriptions[categoryName as keyof typeof descriptions] ||
      "An incident has occurred that requires investigation and resolution.",
  };
}

// Helper function to create status notes and set the final incident status
async function createStatusNotesAndSetFinalStatus(
  incidentId: string,
  createdAt: Date,
  users: User[]
) {
  const statusOrder = [
    "REPORTED",
    "ACKNOWLEDGED",
    "INVESTIGATING",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
  ];

  // Randomly decide how many status transitions to create (from 1 up to all)
  const numTransitions = Math.floor(Math.random() * statusOrder.length) + 1;
  let lastStatus = "REPORTED";

  for (let i = 0; i < numTransitions; i++) {
    const status = statusOrder[i];
    lastStatus = status;

    // Create a date that progresses from the createdAt date
    const changedAt = new Date(createdAt);
    changedAt.setHours(changedAt.getHours() + i * 2); // Progress status every 2 hours
    changedAt.setMinutes(
      changedAt.getMinutes() + faker.number.int({ min: 0, max: 59 })
    );

    const changedByUser = users[Math.floor(Math.random() * users.length)];

    await prisma.incidentStatusNote.create({
      data: {
        incidentId,
        status: status,
        note: faker.lorem.sentence(),
        changedAt,
        changedById: changedByUser.id,
      },
    });
  }

  // Update the incident with the final status
  await prisma.incident.update({
    where: { id: incidentId },
    data: { status: lastStatus },
  });

  
}

async function seedIncidents() {
  

  try {
    // 1. Clear existing incident-related data
    await prisma.incidentStatusNote.deleteMany({});
    await prisma.userIncidentReadStatus.deleteMany({});
    await prisma.attachment.deleteMany({});
    await prisma.incident.deleteMany({});
    

    // 2. Get existing users, departments, and categories
    const users = await prisma.user.findMany();
    const departments = await prisma.department.findMany();
    const categories = await prisma.incidentCategory.findMany();

    if (users.length === 0) {
      throw new Error("No users found. Please seed users first.");
    }
    if (departments.length === 0 || categories.length === 0) {
      throw new Error(
        "No departments or categories found. Please run the metadata seeder first."
      );
    }

    

    // 3. Generate incidents for each department
    for (const dept of departments) {
      

      for (let i = 0; i < 3; i++) {
        const occurredAt = faker.date.recent({ days: 45 });
        const createdAt = faker.date.between({
          from: occurredAt,
          to: new Date(),
        });

        const reporter = users[Math.floor(Math.random() * users.length)];
        const category =
          categories[Math.floor(Math.random() * categories.length)];

        const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
        const priorities = ["URGENT", "HIGH", "NORMAL", "LOW"];
        const severity = severities[
          Math.floor(Math.random() * severities.length)
        ] as any;
        const priority = priorities[
          Math.floor(Math.random() * priorities.length)
        ] as any;

        const incidentDetails = generateIncidentDetails(
          dept.name,
          category.name
        );

        const incident = await prisma.incident.create({
          data: {
            title: incidentDetails.title,
            description: incidentDetails.description,
            occurredAt,
            createdAt,
            status: "REPORTED", // Initial status
            severity,
            priority,
            departmentId: dept.id,
            categoryId: category.id,
            reporterId: reporter.id,
            assigneeId: null, // No assignee as requested
          },
        });

        

        // 4. Create status notes for the new incident
        await createStatusNotesAndSetFinalStatus(incident.id, createdAt, users);
      }
    }

    
  } catch (error) {
    logger.error("Error during incident seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedIncidents()
  .then(() => 
  .catch((error) => {
    logger.error("Incident seeding failed:", error);
    process.exit(1);
  });
