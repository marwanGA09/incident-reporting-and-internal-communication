// prisma/seed.ts

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Seed Departments
  const departments = await prisma.department.createMany({
    data: [
      { name: "Newsroom", email: "newsroom@obn.et" },
      { name: "Technical Support", email: "tech@obn.et" },
      { name: "Human Resources", email: "hr@obn.et" },
      { name: "Broadcast Operations", email: "broadcast@obn.et" },
      { name: "Logistics", email: "logistics@obn.et" },
    ],
  });

  // Seed Incident Categories
  const categories = await prisma.incidentCategory.createMany({
    data: [
      { name: "Technical", description: "System or infrastructure failure" },
      { name: "HR", description: "Workplace conflict or misconduct" },
      { name: "Safety", description: "Physical hazard or injury risk" },
      {
        name: "Broadcast Disruption",
        description: "Live feed or programming issue",
      },
      { name: "Equipment", description: "Broken or malfunctioning gear" },
      { name: "other", description: "" },
    ],
  });

  console.log({ departments });
  // console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
