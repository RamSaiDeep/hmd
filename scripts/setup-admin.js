// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function setupAdmin() {
  try {
    // Replace with your admin email
    const adminEmail = 'hmd.psn.portal.app@gmail.com';
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (user) {
      // Update to admin role
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'admin' }
      });
      
      console.log(`✅ User ${adminEmail} updated to admin role`);
      console.log('User details:', updatedUser);
    } else {
      console.log(`❌ User ${adminEmail} not found in database`);
      console.log('Please make sure the user is registered first');
    }
    
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
