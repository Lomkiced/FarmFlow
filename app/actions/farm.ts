'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireFarmer } from '@/lib/dal';
import { farmSchema } from '@/lib/validations/farm';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import type { ActionState } from './crops';

const TZ = 'Asia/Manila';

function isValidMediaUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
}

function parsePracticesInput(raw: FormDataEntryValue | null, allEntries: FormDataEntryValue[]): string[] {
  if (allEntries.length > 1) {
    return Array.from(
      new Set(
        allEntries
          .map((v) => String(v).trim())
          .filter(Boolean)
      )
    );
  }
  if (!raw) return [];
  const str = String(raw).trim();
  if (!str) return [];
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return Array.from(new Set(parsed.map((x) => String(x).trim()).filter(Boolean)));
      }
    } catch {
      // fall through to comma split
    }
  }
  return Array.from(
    new Set(
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

// ─── Get Farm Profile ─────────────────────────────────────────────────────────

export async function getFarmProfileAction() {
  const { farmId } = await requireFarmer();

  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
      },
      products: {
        orderBy: { createdAt: 'desc' },
      },
      crops: {
        orderBy: { createdAt: 'desc' },
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
  const { id: userId, farmId } = await requireFarmer();

  const practicesEntries = formData.getAll('practices');
  const practices = parsePracticesInput(formData.get('practices'), practicesEntries);

  const raw = {
    farmName: formData.get('farmName') || formData.get('name'),
    barangay: formData.get('barangay'),
    municipality: formData.get('municipality') || formData.get('location') || 'Agoo',
    province: formData.get('province') || 'La Union',
    landArea: formData.get('landArea'),
    bio: (formData.get('bio') ?? formData.get('description') ?? '') as string,
    practices,
    firstName: (formData.get('firstName') as string) || undefined,
    lastName: (formData.get('lastName') as string) || undefined,
    phone: (formData.get('phone') as string) ?? undefined,
  };

  const parsed = farmSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the validation errors and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Optional media updates (supports explicit clearing via 'REMOVE' or empty marker)
  const rawCover = (formData.get('coverPhotoUrl') ?? formData.get('bannerUrl')) as string | null;
  const rawAvatar = formData.get('avatarUrl') as string | null;
  const rawCert = (formData.get('certificateUrl') ?? formData.get('farmDocUrl')) as string | null;

  const farmUpdateData: Record<string, unknown> = {
    farmName: parsed.data.farmName,
    barangay: parsed.data.barangay,
    municipality: parsed.data.municipality,
    province: parsed.data.province,
    landArea: parsed.data.landArea,
    bio: parsed.data.bio ? parsed.data.bio : null,
    practices: parsed.data.practices ?? [],
  };

  if (rawCover === 'REMOVE') {
    farmUpdateData.coverPhoto = null;
  } else if (rawCover && isValidMediaUrl(rawCover)) {
    farmUpdateData.coverPhoto = rawCover;
  }

  if (rawCert === 'REMOVE') {
    farmUpdateData.farmDocUrl = null;
  } else if (rawCert && isValidMediaUrl(rawCert)) {
    farmUpdateData.farmDocUrl = rawCert;
  }

  const userUpdateData: Record<string, unknown> = {};
  const combinedName = `${parsed.data.firstName || ''} ${parsed.data.lastName || ''}`.trim();
  if (combinedName.length >= 2) {
    userUpdateData.name = combinedName;
  }
  if (parsed.data.phone !== undefined) {
    userUpdateData.phone = parsed.data.phone ? parsed.data.phone.trim() : null;
  }
  if (rawAvatar === 'REMOVE') {
    userUpdateData.avatarUrl = null;
  } else if (rawAvatar && isValidMediaUrl(rawAvatar)) {
    userUpdateData.avatarUrl = rawAvatar;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.farm.update({
        where: { id: farmId },
        data: farmUpdateData,
      });

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }
    });

    revalidatePath('/farmer/farm-profile');
    revalidatePath('/farmer/dashboard');
    revalidatePath('/farmers');
    revalidatePath(`/farmers/${farmId}`);

    return { success: true, message: 'Farm profile updated successfully.' };
  } catch (err) {
    console.error('[updateFarmProfileAction]', err);
    return { success: false, error: 'Failed to update farm profile. Please try again.' };
  }
}

export async function updateFarmProfile(prevState: ActionState, formData: FormData) {
  return updateFarmProfileAction(prevState, formData);
}

// ─── Quick Profile Media Update (Avatar & Cover Photo) ───────────────────────

export async function updateFarmerMediaAction(payload: {
  avatarUrl?: string | null;
  coverPhoto?: string | null;
  bannerUrl?: string | null;
}): Promise<ActionState> {
  const { id: userId, farmId } = await requireFarmer();

  const hasAvatar = Object.prototype.hasOwnProperty.call(payload, 'avatarUrl');
  const hasCover =
    Object.prototype.hasOwnProperty.call(payload, 'coverPhoto') ||
    Object.prototype.hasOwnProperty.call(payload, 'bannerUrl');

  const nextAvatar = payload.avatarUrl;
  const nextCover = Object.prototype.hasOwnProperty.call(payload, 'coverPhoto')
    ? payload.coverPhoto
    : payload.bannerUrl;

  if (hasAvatar && nextAvatar !== null && nextAvatar !== undefined && !isValidMediaUrl(nextAvatar)) {
    return { success: false, error: 'Invalid profile picture URL.' };
  }
  if (hasCover && nextCover !== null && nextCover !== undefined && !isValidMediaUrl(nextCover)) {
    return { success: false, error: 'Invalid cover photo URL.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (hasAvatar) {
        await tx.user.update({
          where: { id: userId },
          data: { avatarUrl: nextAvatar ?? null },
        });
      }
      if (hasCover) {
        await tx.farm.update({
          where: { id: farmId },
          data: { coverPhoto: nextCover ?? null },
        });
      }
    });

    revalidatePath('/farmer/farm-profile');
    revalidatePath('/farmer/dashboard');
    revalidatePath('/farmers');
    revalidatePath(`/farmers/${farmId}`);

    return { success: true, message: 'Profile media updated.' };
  } catch (err) {
    console.error('[updateFarmerMediaAction]', err);
    return { success: false, error: 'Failed to update profile media.' };
  }
}

// ─── Update Avatar URL ────────────────────────────────────────────────────────

export async function updateAvatarUrlAction(avatarUrl: string | null): Promise<ActionState> {
  return updateFarmerMediaAction({ avatarUrl });
}

// ─── Update Cover Photo URL ───────────────────────────────────────────────────

export async function updateCoverPhotoUrlAction(coverPhotoUrl: string | null): Promise<ActionState> {
  return updateFarmerMediaAction({ coverPhoto: coverPhotoUrl });
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
    lifetimeTotalOrders,
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
          refundStatus: { notIn: ['REFUNDED', 'APPROVED'] },
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
          refundStatus: { notIn: ['REFUNDED', 'APPROVED'] },
        },
      },
      _sum: { subtotal: true },
    }),

    // Lifetime total orders (all orders containing this farm's products)
    prisma.order.count({
      where: {
        items: { some: { product: { farmId } } },
      },
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
        paymentStatus: 'PAID',
        refundStatus: { notIn: ['REFUNDED', 'APPROVED'] },
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
    total: d.total,
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
    lifetimeTotalOrders,
  };
}

// ─── Public Farm Queries ──────────────────────────────────────────────────────

export async function getPublicFarmersAction(params?: {
  search?: string;
  sort?: 'rating' | 'products' | 'name';
}) {
  const search = params?.search?.trim();
  const sort = params?.sort ?? 'rating';

  const whereClause: any = {
    status: 'VERIFIED',
    ...(search
      ? {
          OR: [
            { farmName: { contains: search, mode: 'insensitive' } },
            { barangay: { contains: search, mode: 'insensitive' } },
            { municipality: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const orderBy: any =
    sort === 'name'
      ? { farmName: 'asc' }
      : sort === 'products'
      ? { products: { _count: 'desc' } }
      : { rating: 'desc' };

  const farms = await prisma.farm.findMany({
    where: whereClause,
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
        select: { products: { where: { status: 'ACTIVE' } } },
      },
    },
    orderBy,
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
            select: { farmName: true, user: { select: { avatarUrl: true } } },
          },
        },
      },
      _count: {
        select: { products: { where: { status: 'ACTIVE' } } },
      },
    },
  });

  return farm;
}

// ─── Get Farmer Notifications ──────────────────────────────────────────────────

export async function getFarmerNotificationsAction() {
  const { id: userId } = await requireFarmer();

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return notifications;
}

// ─── Mark Notification As Read ────────────────────────────────────────────────

export async function markNotificationAsReadAction(id: string) {
  const { id: userId } = await requireFarmer();
  try {
    await prisma.notification.updateMany({
      where: { id, recipientId: userId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to mark notification.' };
  }
}

// ─── Mark All Farmer Notifications As Read ────────────────────────────────────

export async function markAllFarmerNotificationsReadAction() {
  const { id: userId } = await requireFarmer();
  try {
    await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath('/farmer/farm-profile');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to mark all notifications as read.' };
  }
}
