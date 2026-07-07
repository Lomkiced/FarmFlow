import { prisma } from './lib/prisma';

async function cleanUser() {
  try {
    const emailsToClean = ['kouseikou13@gmail.com', 'juan@example.com'];
    console.log(`Looking for users with emails: ${emailsToClean.join(', ')}`);
    
    // Find case-insensitive
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: emailsToClean,
          mode: 'insensitive'
        }
      }
    });

    if (users.length === 0) {
      console.log('No user found in Prisma database.');
    } else {
      for (const user of users) {
        console.log(`Found user: ${user.email} (ID: ${user.id}). Deleting...`);
        
        // Clean up relations first
        await prisma.address.deleteMany({ where: { userId: user.id } });
        await prisma.notification.deleteMany({ where: { relatedId: user.id } });
        await prisma.order.deleteMany({ where: { buyerId: user.id } });
        // Farm deletion if they were a farmer
        const farm = await prisma.farm.findUnique({ where: { userId: user.id } });
        if (farm) {
          await prisma.activity.deleteMany({ where: { farmId: farm.id } });
          await prisma.orderItem.deleteMany({ where: { product: { farmId: farm.id } } });
          await prisma.product.deleteMany({ where: { farmId: farm.id } });
          await prisma.crop.deleteMany({ where: { farmId: farm.id } });
          await prisma.farm.delete({ where: { id: farm.id } });
        }
        
        // Finally delete the user
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`Successfully deleted ghost user: ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanUser();
