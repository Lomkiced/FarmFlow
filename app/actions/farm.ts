'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireFarmer } from '@/lib/dal';
import { farmSchema } from '@/lib/validations/farm';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TZ = 'Asia/Manila';
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
    readyForPayout,
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
    prisma.orderItem.aggregate({
      where: {
        product: { farmId },
        order: {
          orderStatus: 'DELIVERED',
          paymentStatus: 'PAID',
          createdAt: {
            gte: (() => {
              const nowZoned = toZonedTime(new Date(), TZ);
              const startOfMonthZoned = new Date(nowZoned.getFullYear(), nowZoned.getMonth(), 1);
              return fromZonedTime(startOfMonthZoned, TZ);
            })(),
          },
        },
      },
      _sum: { subtotal: true },
    }),

    // Crops with expected harvest in next 14 days
    prisma.crop.findMany({
      where: {
        farmId,
        stage: { in: ['GROWING', 'READY_TO_HARVEST'] },
        expectedHarvest: {
          lte: (() => {
            const nowZoned = toZonedTime(new Date(), TZ);
            const in14Days = new Date(nowZoned.getTime() + 14 * 24 * 60 * 60 * 1000);
            return fromZonedTime(in14Days, TZ);
          })(),
          gte: (() => {
            const nowZoned = toZonedTime(new Date(), TZ);
            return fromZonedTime(nowZoned, TZ);
          })(),
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

    // Ready for payout (all time delivered and paid orders)
    prisma.orderItem.aggregate({
      where: {
        product: { farmId },
        order: {
          orderStatus: 'DELIVERED',
          paymentStatus: 'PAID',
        },
      },
      _sum: { subtotal: true },
    }),
  ]);

  // Weekly breakdown
  const nowZoned = toZonedTime(new Date(), TZ);
  const startOfWeekZoned = new Date(nowZoned.getTime());
  startOfWeekZoned.setDate(startOfWeekZoned.getDate() - (startOfWeekZoned.getDay() === 0 ? 6 : startOfWeekZoned.getDay() - 1));
  startOfWeekZoned.setHours(0, 0, 0, 0);

  const startOfWeekUtc = fromZonedTime(startOfWeekZoned, TZ);

  const weekOrderItems = await prisma.orderItem.findMany({
    where: {
      product: { farmId },
      order: {
        orderStatus: 'DELIVERED',
        createdAt: { gte: startOfWeekUtc },
      },
    },
    include: { order: { select: { createdAt: true } } },
  });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const rawWeekData = weekDays.map(day => ({ day, total: 0 }));

  weekOrderItems.forEach(item => {
    const itemZoned = toZonedTime(item.order.createdAt, TZ);
    let dayIndex = itemZoned.getDay() - 1;
    if (dayIndex === -1) dayIndex = 6;
    rawWeekData[dayIndex].total += item.subtotal;
  });

  const maxTotal = Math.max(...rawWeekData.map(d => d.total), 1);
  const weekData = rawWeekData.map(d => ({
    day: d.day,
    height: `${Math.round((d.total / maxTotal) * 100)}%`,
    highlight: d.total === maxTotal && d.total > 0,
    total: d.total, // keep actual total for reference if needed
  }));

  return {
    activeCropsCount,
    pendingOrdersCount,
    thisMonthEarnings: thisMonthEarnings._sum.subtotal ?? 0,
    readyForPayout: readyForPayout._sum.subtotal ?? 0,
    weekData,
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

// ─── Get Farmer Notifications ──────────────────────────────────────────────────

export async function getFarmerNotificationsAction() {
  const farmerUser = await requireFarmer();
  const farmId = farmerUser.farmId;

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { relatedId: farmId },
        { relatedId: farmerUser.id },
      ]
    },
    orderBy: { createdAt: 'desc' },
  });

  return notifications;
}

// ─── Mark Notification As Read ────────────────────────────────────────────────

export async function markNotificationAsReadAction(id: string) {
  await requireFarmer();
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to mark notification.' };
  }

}
