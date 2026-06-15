import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@farmflow.ph' },
    update: {},
    create: {
      email: 'admin@farmflow.ph',
      name: 'FarmFlow Admin',
      role: 'ADMIN',
    },
  });

  const farmer = await prisma.user.upsert({
    where: { email: 'juan@farm.com' },
    update: {},
    create: {
      email: 'juan@farm.com',
      name: 'Juan Dela Cruz',
      role: 'FARMER',
      phone: '+639171234567',
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@store.com' },
    update: {},
    create: {
      email: 'buyer@store.com',
      name: 'Maria Clara',
      role: 'BUYER',
      phone: '+639181234567',
    },
  });

  // 2. Create Farm
  const farm = await prisma.farm.upsert({
    where: { userId: farmer.id },
    update: {},
    create: {
      userId: farmer.id,
      farmName: 'Dela Cruz Family Farm',
      barangay: 'San Vicente',
      municipality: 'Agoo',
      province: 'La Union',
      landArea: 2.5,
      bio: 'Sustainable organic farming since 1990.',
      status: 'VERIFIED',
    },
  });

  // 3. Create Crops
  const crop1 = await prisma.crop.create({
    data: {
      farmId: farm.id,
      cropName: 'Carrots',
      variety: 'Nantes',
      areaSqm: 25000,
      datePlanted: new Date('2023-09-01'),
      expectedHarvest: new Date('2023-12-01'),
      stage: 'GROWING',
    },
  });

  // 4. Create Product (Listing)
  const product1 = await prisma.product.create({
    data: {
      farmId: farm.id,
      name: 'Fresh Organic Carrots',
      description: 'Newly harvested, premium organic carrots from Benguet.',
      pricePerKg: 45.0,
      stockKg: 2000,
      category: 'VEGETABLES',
      status: 'ACTIVE',
      photos: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80'],
    },
  });

  // 5. Create Address for Buyer
  const address = await prisma.address.create({
    data: {
      userId: buyer.id,
      label: 'Main Warehouse',
      fullName: 'Maria Clara',
      phone: '+639181234567',
      street: '123 Market St',
      barangay: 'San Lorenzo',
      city: 'Makati City',
      province: 'Metro Manila',
      zipCode: '1223',
      isDefault: true,
    },
  });

  // 6. Create Order
  const order = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      addressId: address.id,
      totalAmount: 4500, // 100kg * 45
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      items: {
        create: [
          {
            productId: product1.id,
            quantityKg: 100,
            pricePerKg: 45.0,
            subtotal: 4500,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding complete!');
  console.log({ admin, farmer, buyer, farm, crop1, product1, order });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
