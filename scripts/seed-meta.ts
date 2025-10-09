import { PrismaClient } from "@prisma/client";
import logger from "../app/lib/logger";

const prisma = new PrismaClient();

async function seedMetadata() {
  try {
    const result = await prisma.$queryRaw`SELECT current_database();`;

    // Clear existing departments and create the OBN-specific ones
    await prisma.department.deleteMany({});

    const departments = [
      { name: "Branch of News" },
      { name: "Department of Educational Program" },
      { name: "Department of Entertainment Program" },
      { name: "Human Resource & Training" },
      { name: "Service of Plan, Research & Budget" },
      { name: "Law Affair Service" },
      { name: "Department of Market & Promotion" },
      { name: "Auditor" },
      { name: "System Administration" },
      { name: "ICT Service" },
      { name: "Maintenance" },
      { name: "Television Broadcasting" },
      { name: "Radio Broadcasting" },
    ];

    for (const dept of departments) {
      await prisma.department.create({
        data: dept,
      });
    }

    // Clear existing incident categories and create the OBN-specific ones
    await prisma.incidentCategory.deleteMany({});

    const categories = [
      {
        name: "Broadcast Disruption",
        description: "Live feed or programming interruption",
      },
      {
        name: "Equipment Failure",
        description: "Broken or malfunctioning broadcasting equipment",
      },
      {
        name: "Content Issue",
        description: "Problem with program content or quality",
      },
      {
        name: "Technical Infrastructure",
        description: "System or network infrastructure problems",
      },
      {
        name: "Security Concern",
        description: "Safety or security threats to staff or facilities",
      },
      {
        name: "Personnel",
        description: "Staffing issues, conflicts, or HR matters",
      },
      {
        name: "Regulatory Compliance",
        description: "Issues related to broadcasting regulations",
      },
      {
        name: "External Relations",
        description: "Matters involving external partners or public relations",
      },
    ];

    for (const category of categories) {
      await prisma.incidentCategory.create({
        data: category,
      });
    }
  } catch (error) {
    logger.error({ error }, "Error during metadata seeding:");
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMetadata()
  .then(() => {})
  .catch((error) => {
    logger.error({ error }, "Metadata seeding failed:");
    process.exit(1);
  });
