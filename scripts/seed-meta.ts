import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedMetadata() {
  console.log("Seeding metadata (Departments and Categories)...");

  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    const result = await prisma.$queryRaw`SELECT current_database();`;
    console.log("Connected to database:", result);

    // Clear existing departments and create the OBN-specific ones
    await prisma.department.deleteMany({});
    console.log("Cleared existing departments");

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
      console.log(`Created department: ${dept.name}`);
    }

    // Clear existing incident categories and create the OBN-specific ones
    await prisma.incidentCategory.deleteMany({});
    console.log("Cleared existing incident categories");

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
      console.log(`Created category: ${category.name}`);
    }

    console.log("Metadata seeding completed successfully!");
  } catch (error) {
    console.error("Error during metadata seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMetadata()
  .then(() => console.log("Metadata seeding process finished."))
  .catch((error) => {
    console.error("Metadata seeding failed:", error);
    process.exit(1);
  });
