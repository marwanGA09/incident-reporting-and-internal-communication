const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  

  // Ensure default departments exist
  let departments = await prisma.department.findMany();
  if (departments.length === 0) {
    
    await prisma.department.createMany({
      data: [
        { name: "Engineering", email: "engineering@example.com" },
        { name: "Human Resources", email: "hr@example.com" },
        { name: "Facilities", email: "facilities@example.com" },
      ],
    });
    departments = await prisma.department.findMany(); // Re-fetch after creation
    
  }

  // Ensure default categories exist
  let categories = await prisma.incidentCategory.findMany({
    where: { isActive: true },
  });
  if (categories.length === 0) {
    
    await prisma.incidentCategory.createMany({
      data: [
        {
          name: "Technical Issue",
          description: "Problems with software or hardware",
        },
        { name: "HR Complaint", description: "Human Resources related issues" },
        {
          name: "Building Maintenance",
          description: "Issues with the physical premises",
        },
      ],
    });
    categories = await prisma.incidentCategory.findMany({
      where: { isActive: true },
    }); // Re-fetch after creation
    
  }

  // Ensure default users exist and fetch them
  let users = await prisma.user.findMany();
  if (users.length === 0 && departments.length > 0) {
    
    await prisma.user.createMany({
      data: [
        {
          firstName: "Alice",
          lastName: "Smith",
          email: "alice@example.com",
          username: "alice",
          departmentId: departments[0].id,
          role: "admin",
        },
        {
          firstName: "Bob",
          lastName: "Johnson",
          email: "bob@example.com",
          username: "bob",
          departmentId: departments[1].id,
          role: "user",
        },
        {
          firstName: "Charlie",
          lastName: "Brown",
          email: "charlie@example.com",
          username: "charlie",
          departmentId: departments[0].id,
          role: "user",
        },
      ],
    });
    users = await prisma.user.findMany(); // Re-fetch after creation
    
  } else if (users.length === 0) {
    
  }

  // 2️⃣ Generate 20 incidents
  const incidentsData = Array.from({ length: 20 }, (_, i) => {
    const department =
      departments[Math.floor(Math.random() * departments.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const reporter =
      users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
    const assignee =
      users.length > 0 && Math.random() > 0.5
        ? users[Math.floor(Math.random() * users.length)]
        : null; // Assignee is optional

    return {
      title: `Incident ${i + 1}: ${category.name}`,
      description: `Auto-generated incident for ${category.name} in ${department.name}. This is a detailed description to test summarization. It includes various keywords and phrases that an AI might pick up on, such as system outage, network issue, employee dispute, broken pipe, etc. The incident occurred during peak hours and affected multiple users. Initial assessment suggests a critical impact.`, // Enhanced description for AI testing
      locationAddress: [
        "Addis Ababa Office",
        "Adama Branch",
        "Hawassa Data Center",
        "Dire Dawa Warehouse",
      ][i % 4],
      categoryId: category.id,
      departmentId: department.id,
      occurredAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ), // within last 30 days
      reporterId: reporter ? reporter.id : undefined, // Assign reporter if users exist
      assigneeId: assignee ? assignee.id : undefined, // Assign assignee if users exist and randomly chosen
    };
  });

  // Filter out incidents that couldn't be assigned a reporter (if no users were created)
  const validIncidentsData = incidentsData.filter(
    (inc) => inc.reporterId !== undefined
  );

  // 3️⃣ Create them in the DB
  await prisma.incident.createMany({
    data: validIncidentsData,
    skipDuplicates: true, // Skip if an incident with the same unique fields already exists
  });

  
}

main()
  .catch((error) => {
    logger.log("error", "❌ Error seeding incidents:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
