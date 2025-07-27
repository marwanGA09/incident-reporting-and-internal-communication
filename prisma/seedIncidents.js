// prisma/seed.ts
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  // console.log("🌱 Seeding incidents...");

  // 1️⃣ Fetch available departments and categories
  const departments = await prisma.department.findMany();
  const categories = await prisma.incidentCategory.findMany({
    where: { isActive: true },
  });

  if (departments.length === 0) {
    throw new Error("❌ No departments found. Please seed departments first.");
  }
  if (categories.length === 0) {
    throw new Error(
      "❌ No active categories found. Please seed categories first."
    );
  }

  // console.log(`✅ Found ${departments.length} departments`);
  // console.log(`✅ Found ${categories.length} active categories`);

  // 2️⃣ Generate 20 incidents
  const incidentsData = Array.from({ length: 20 }, (_, i) => {
    const department =
      departments[Math.floor(Math.random() * departments.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    return {
      title: `Incident ${i + 1}: ${category.name}`,
      description: `Auto-generated incident for ${category.name} in ${department.name}.`,
      location: ["Addis Ababa", "Adama", "Hawassa", "Dire Dawa"][i % 4],
      categoryId: category.id,
      departmentId: department.id,
    };
  });

  // 3️⃣ Create them in the DB
  await prisma.incident.createMany({
    data: incidentsData,
  });

  // console.log(`✅ Seeded ${incidentsData.length} incidents`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
