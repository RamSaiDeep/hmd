// Load environment variables
require("dotenv").config({ path: ".env.local" });

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function setupSuperUser() {
  const email = process.argv[2];

  if (!email) {
    console.log("Usage: node scripts/setup-superuser.js <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log(`User ${email} not found. Register first, then run this script.`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: "superuser" },
    });

    console.log(`User ${email} updated to superuser`);
    console.log(updatedUser);
  } catch (error) {
    console.error("Error setting up superuser:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupSuperUser();
