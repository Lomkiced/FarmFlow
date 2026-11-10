import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Starting FarmFlow La Union database seeding...');

  // 1. Create Users with Verified KYC & ID Matching
  const admin = await prisma.user.upsert({
    where: { email: 'admin@farmflow.ph' },
    update: {
      idVerifiedMatch: true,
      idMatchScore: 100,
    },
    create: {
      email: 'admin@farmflow.ph',
      name: 'FarmFlow Admin',
      role: 'ADMIN',
      idVerifiedMatch: true,
      idMatchScore: 100,
    },
  });

  const farmer = await prisma.user.upsert({
    where: { email: 'juan@farm.com' },
    update: {
      idType: 'RSBSA_ID',
      idNumber: '01-33-05-001-000123',
      rsbsaNumber: '01-33-05-001-000123',
      idNameOnDocument: 'Juan Dela Cruz',
      idDocumentUrl: '/images/FARMER1.jpg',
      idVerifiedMatch: true,
      idMatchScore: 100,
    },
    create: {
      email: 'juan@farm.com',
      name: 'Juan Dela Cruz',
      role: 'FARMER',
      phone: '09171234567',
      idType: 'RSBSA_ID',
      idNumber: '01-33-05-001-000123',
      rsbsaNumber: '01-33-05-001-000123',
      idNameOnDocument: 'Juan Dela Cruz',
      idDocumentUrl: '/images/FARMER1.jpg',
      idVerifiedMatch: true,
      idMatchScore: 100,
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@store.com' },
    update: {
      idType: 'PHILSYS_NATIONAL_ID',
      idNumber: '1234-5678-9012-3456',
      idNameOnDocument: 'Maria Clara',
      idDocumentUrl: '/images/FARMER1.jpg',
      idVerifiedMatch: true,
      idMatchScore: 100,
    },
    create: {
      email: 'buyer@store.com',
      name: 'Maria Clara',
      role: 'BUYER',
      phone: '09181234567',
      idType: 'PHILSYS_NATIONAL_ID',
      idNumber: '1234-5678-9012-3456',
      idNameOnDocument: 'Maria Clara',
      idDocumentUrl: '/images/FARMER1.jpg',
      idVerifiedMatch: true,
      idMatchScore: 100,
    },
  });

  // 2. Create Farm with Verified KYC & RSBSA
  const farm = await prisma.farm.upsert({
    where: { userId: farmer.id },
    update: {
      idType: 'RSBSA_ID',
      idNumber: '01-33-05-001-000123',
      rsbsaNumber: '01-33-05-001-000123',
      idNameOnDocument: 'Juan Dela Cruz',
      idDocumentUrl: '/images/FARMER1.jpg',
      idVerifiedMatch: true,
      idMatchScore: 100,
      status: 'VERIFIED',
    },
    create: {
      userId: farmer.id,
      farmName: 'Dela Cruz Family Farm',
      barangay: 'San Vicente Norte',
      municipality: 'Agoo',
      province: 'La Union',
      landArea: 2.5,
      bio: 'Sustainable organic farming in Agoo, La Union since 1990.',
      status: 'VERIFIED',
      rating: 4.9,
      idType: 'RSBSA_ID',
      idNumber: '01-33-05-001-000123',
      rsbsaNumber: '01-33-05-001-000123',
      idNameOnDocument: 'Juan Dela Cruz',
      idDocumentUrl: '/images/FARMER1.jpg',
      idVerifiedMatch: true,
      idMatchScore: 100,
    },
  });

  // 3. Create Crop ready for 1-Click ERP Marketplace Listing
  const crop1 = await prisma.crop.create({
    data: {
      farmId: farm.id,
      cropName: 'Heirloom Tomatoes',
      variety: 'Ilocos Red Diamond',
      areaSqm: 120,
      datePlanted: new Date(Date.now() - 86400000 * 65),
      expectedHarvest: new Date(Date.now() + 86400000 * 3),
      stage: 'READY_TO_HARVEST',
    },
  });

  // 4. Create Product Listing
  const product1 = await prisma.product.create({
    data: {
      farmId: farm.id,
      cropId: crop1.id,
      name: 'Fresh Ilocos Heirloom Tomatoes',
      description: 'Newly harvested, crisp heirloom tomatoes from San Vicente Norte, Agoo, La Union.',
      pricePerKg: 65.0,
      stockKg: 300,
      minOrderQty: 0.25,
      wholesalePrice: 52.0,
      wholesaleMinQty: 20,
      category: 'VEGETABLES',
      status: 'ACTIVE',
      deliveryAvail: true,
      harvestDate: new Date(),
      photos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80'],
    },
  });

  // 5. Create Address for Buyer in Agoo, La Union
  const address = await prisma.address.create({
    data: {
      userId: buyer.id,
      label: 'Agoo Town Center Commissary',
      fullName: 'Maria Clara',
      phone: '09181234567',
      street: '45 MacArthur Highway',
      barangay: 'Consolacion',
      city: 'Agoo',
      province: 'La Union',
      zipCode: '2504',
      isDefault: true,
    },
  });

  // 6. Create Order with Shopee / TikTok Shop-Style Logistics Checkpoints
  const now = Date.now();
  const order = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      addressId: address.id,
      totalAmount: 1350,
      deliveryFee: 50,
      orderStatus: 'READY',
      paymentStatus: 'PAID',
      trackingNumber: 'FF-LU-2026-884920',
      courierName: 'FarmFlow Cold-Chain Express',
      driverName: 'Kuya Bong Navarro',
      driverPhone: '0917-842-9910',
      vehicleInfo: 'White Mitsubishi L300 Reefer Van • Plate: NGA-4821',
      estimatedDelivery: 'Today, 2:00 PM - 4:00 PM',
      logisticsLogs: [
        {
          id: 'seed-log-4',
          timestamp: new Date(now - 10 * 60000).toISOString(),
          status: 'OUT_FOR_DELIVERY',
          title: 'Out for Delivery — Rider is 10–15 mins away',
          description:
            'Rider Kuya Bong Navarro (White Mitsubishi L300 Reefer Van • Plate: NGA-4821) is approaching Brgy. Consolacion, Agoo.',
          location: 'Brgy. Consolacion, Agoo, La Union',
          actor: 'Kuya Bong Navarro',
          badge: 'Rider Nearby',
        },
        {
          id: 'seed-log-3',
          timestamp: new Date(now - 45 * 60000).toISOString(),
          status: 'SORTING_DISPATCH',
          title: 'Dispatched to Courier',
          description:
            'Order handed over to FarmFlow Cold-Chain Express — Rider: Kuya Bong Navarro. Tracking #: FF-LU-2026-884920.',
          location: 'La Union Agri-Hub • Agoo',
          actor: 'FarmFlow Cold-Chain Express',
          badge: 'Dispatched',
        },
        {
          id: 'seed-log-2',
          timestamp: new Date(now - 90 * 60000).toISOString(),
          status: 'HARVESTED_QC',
          title: 'Harvested & Quality Checked',
          description:
            'Fresh produce harvested at Dela Cruz Family Farm, weighed, and passed Quality & Freshness Inspection.',
          location: 'Brgy. San Vicente Norte, Agoo, La Union',
          actor: 'Dela Cruz Family Farm',
          badge: '100% Fresh QC',
        },
        {
          id: 'seed-log-1',
          timestamp: new Date(now - 150 * 60000).toISOString(),
          status: 'ORDER_PLACED',
          title: 'Order Placed',
          description: 'Order submitted. Payment secured in FarmFlow Escrow.',
          location: 'Brgy. Consolacion, Agoo',
          actor: 'Buyer',
          badge: 'Escrow Secured',
        },
      ],
      items: {
        create: [
          {
            productId: product1.id,
            quantityKg: 25,
            pricePerKg: 52.0,
            subtotal: 1300,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding complete!');
  console.log({ admin: admin.email, farmer: farmer.email, buyer: buyer.email, farm: farm.farmName, crop1: crop1.cropName, product1: product1.name, order: order.trackingNumber });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
