const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.hotel.createMany({
    data: [
      { name: "Grand Hotel", location: "Paris", rooms_available: 5 },
      { name: "Beach Resort", location: "Hawaii", rooms_available: 10 },
      { name: "Mountain Inn", location: "Switzerland", rooms_available: 7 },
    ],
  });

  console.log("Hotels seeded successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
