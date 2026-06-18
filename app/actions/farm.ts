'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireFarmer } from '@/lib/dal';
import { farmSchema } from '@/lib/validations/farm';
import type { ActionState } from './crops';

// ─── Get Farm Profile ─────────────────────────────────────────────────────────

export async function getFarmProfileAction() {
  const { farmId } = await requireFarmer();

  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    include: {
      user: {
        select: { name: true, email: true, phone: true, avatarUrl: true },
      },
      _count: {
        select: {
          crops: true,
          products: { where: { status: 'ACTIVE' } },
        },
      },
    },
  });

  return farm;
}

// ─── Update Farm Profile ──────────────────────────────────────────────────────

export async function updateFarmProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  const raw = {
    farmName: formData.get('farmName'),
    barangay: formData.get('barangay'),
    municipality: formData.get('municipality') || 'Agoo',
    province: formData.get('province') || 'La Union',
    landArea: formData.get('landArea'),
    bio: formData.get('bio') || undefined,
  };

  const parsed = farmSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Handle cover photo URL (uploaded separately via uploadFarmCoverPhoto)
  const coverPhotoUrl = formData.get('coverPhotoUrl') as string | null;

  try {
    await prisma.farm.update({
      where: { id: farmId },
      data: {
        farmName: parsed.data.farmName,
        barangay: parsed.data.barangay,
        municipality: parsed.data.municipality,
        province: parsed.data.province,
        landArea: parsed.data.landArea,
        bio: parsed.data.bio,
        ...(coverPhotoUrl ? { coverPhoto: coverPhotoUrl } : {}),
      },
    });

    revalidatePath('/farmer/farm-profile');
    revalidatePath('/farmer/dashboard');

    return { success: true, message: 'Farm profile updated successfully!' };
  } catch (err) {
    console.error('[updateFarmProfile]', err);
    return { success: false, error: 'Failed to update farm profile. Please try again.' };
  }
}

// ─── Get Farmer Dashboard Stats ───────────────────────────────────────────────

export async function getFarmerDashboardStatsAction() {
  const { farmId } = await requireFarmer();

  const [
    activeCropsCount,
    pendingOrdersCount,
    thisMonthEarnings,
    upcomingHarvests,
    recentOrders,
    totalProducts,
  ] = await Promise.all([
    // Active crops (not yet harvested)
    prisma.crop.count({
      where: { farmId, stage: { not: 'HARVESTED' } },
    }),

    // Orders waiting for farmer action
    prisma.order.count({
      where: {
        items: { some: { product: { farmId } } },
        orderStatus: 'PENDING',
      },
    }),

    // This month's earnings (DELIVERED orders)
    prisma.order.aggregate({
      where: {
        items: { some: { product: { farmId } } },
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalAmount: true },
    }),

    // Crops with expected harvest in next 14 days
    prisma.crop.findMany({
      where: {
        farmId,
        stage: { in: ['GROWING', 'READY_TO_HARVEST'] },
        expectedHarvest: {
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      orderBy: { expectedHarvest: 'asc' },
      take: 5,
    }),

    // Recent 5 orders
    prisma.order.findMany({
      where: {
        items: { some: { product: { farmId } } },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { name: true } },
        items: {
          where: { product: { farmId } },
          include: { product: { select: { name: true } } },
          take: 2,
        },
      },
    }),

    // Total active product listings
    prisma.product.count({
      where: { farmId, status: 'ACTIVE' },
    }),
  ]);

  return {
    activeCropsCount,
    pendingOrdersCount,
    thisMonthEarnings: thisMonthEarnings._sum.totalAmount ?? 0,
    upcomingHarvests,
    recentOrders,
    totalProducts,
  };
}

// ─── Public Farm Queries ──────────────────────────────────────────────────────

export async function getPublicFarmersAction() {
  const farms = await prisma.farm.findMany({
    where: {
      status: { in: ['VERIFIED', 'PENDING'] },
    },
    include: {
      user: {
        select: { avatarUrl: true, name: true },
      },
      products: {
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, photos: true, pricePerKg: true },
        take: 3,
      },
      _count: {
        select: { products: { where: { status: 'ACTIVE' } } }
      }
    },
    orderBy: {
      rating: 'desc',
    },
  });

  return farms;
}

export async function getPublicFarmerByIdAction(id: string) {
  const farm = await prisma.farm.findUnique({
    where: { id },
    include: {
      user: {
        select: { avatarUrl: true, name: true },
      },
      products: {
        where: { status: 'ACTIVE' },
        include: {
          farm: {
            select: { farmName: true, user: { select: { avatarUrl: true } } }
          }
        }
      },
      _count: {
        select: { products: { where: { status: 'ACTIVE' } } }
      }
    },
  });

  return farm;
}
