const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: '.env' });

function createPrismaClient() {
  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
  const databaseUrl = process.env.DATABASE_URL;

  // Use Accelerate if provided
  if (accelerateUrl) {
    console.log('[prisma] Using PRISMA_ACCELERATE_URL');
    return new PrismaClient({
      accelerateUrl,
      log: ["query", "info", "warn", "error"],
    });
  }

  // Use PostgreSQL adapter
  if (databaseUrl) {
    console.log('[prisma] Using PostgreSQL adapter');
    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });
    return new PrismaClient({
      adapter,
      log: ["query", "info", "warn", "error"],
    });
  }

  throw new Error('No Prisma configuration found. Set either PRISMA_ACCELERATE_URL or DATABASE_URL.');
}

const prisma = createPrismaClient();

async function migrateMusicRequests() {
  console.log('Starting music request migration...');
  
  try {
    // Get all music requests without userId
    const musicRequests = await prisma.musicRequest.findMany({
      where: {
        userId: null
      }
    });
    
    console.log(`Found ${musicRequests.length} music requests to migrate`);
    
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in database`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // Update each music request
    for (const request of musicRequests) {
      // Try to find user by organizer email
      const user = users.find(u => u.email === request.organizer);
      
      if (user) {
        // Update the music request with userId
        await prisma.musicRequest.update({
          where: { id: request.id },
          data: { userId: user.id }
        });
        
        console.log(`Updated request "${request.eventName}" - User: ${user.name || user.email}`);
        updatedCount++;
      } else {
        console.log(`No user found for request "${request.eventName}" - Organizer: ${request.organizer}`);
        notFoundCount++;
      }
    }
    
    console.log('\nMigration completed:');
    console.log(`- Updated: ${updatedCount} requests`);
    console.log(`- Not found: ${notFoundCount} requests`);
    console.log(`- Total processed: ${musicRequests.length} requests`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateMusicRequests()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
