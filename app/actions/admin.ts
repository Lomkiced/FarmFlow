'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/dal';
import { sendAdminNotification, sendFarmerNotification } from '@/lib/notifications';
import type { ActionState } from './crops';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getAdminDashboardStatsAction() {
  await requireAdmin();

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

  const [
    totalFarmers,
    pendingFarmers,
    pendingListings,
    activeListings,
    totalOrders,
    thisMonthRevenue,
    lastMonthRevenue,
    recentRegistrations,
    ordersByStatus,
  ] = await Promise.all([
    prisma.farm.count(),
    prisma.farm.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: {
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalAmount: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true, avatarUrl: true },
    }),
    prisma.order.groupBy({
      by: ['orderStatus'],
      _count: { id: true },
    }),
  ]);

  const thisMonth = thisMonthRevenue._sum.totalAmount ?? 0;
  const lastMonth = lastMonthRevenue._sum.totalAmount ?? 0;
  const revenueGrowth =
    lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null;

  return {
    totalFarmers,
    pendingFarmers,
    pendingListings,
    activeListings,
    totalOrders,
    thisMonthRevenue: thisMonth,
    lastMonthRevenue: lastMonth,
    revenueGrowth,
    recentRegistrations,
    ordersByStatus,
  };
}

// ─── Farmer Management ────────────────────────────────────────────────────────

export async function getFarmersAction(
  status?: 'PENDING' | 'VERIFIED' | 'SUSPENDED',
  page = 1,
  pageSize = 20,
  filters?: { location?: string; dateFrom?: string; dateTo?: string }
) {
  await requireAdmin();

  const whereClause: any = status ? { status } : {};

  if (filters?.location) {
    whereClause.OR = [
      { barangay: { contains: filters.location, mode: 'insensitive' } },
      { municipality: { contains: filters.location, mode: 'insensitive' } },
      { province: { contains: filters.location, mode: 'insensitive' } },
    ];
  }

  if (filters?.dateFrom || filters?.dateTo) {
    whereClause.createdAt = {};
    if (filters.dateFrom) {
      whereClause.createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = toDate;
    }
  }

  const [farmers, total] = await Promise.all([
    prisma.farm.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
        _count: { select: { crops: true, products: true } },
      },
    }),
    prisma.farm.count({ where: whereClause }),
  ]);

  return { farmers, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function approveFarmerAction(farmId: string): Promise<ActionState> {
  await requireAdmin();

  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) return { success: false, error: 'Farm not found.' };

  try {
    await prisma.farm.update({
      where: { id: farmId },
      data: { status: 'VERIFIED' },
    });

    // Notify the farmer their account has been approved
    sendFarmerNotification(farm.userId, {
      type: 'ACCOUNT_APPROVED',
      title: '🎉 Account Approved!',
      message: `Congratulations! Your farm "${farm.farmName}" has been verified. You can now list products on the marketplace.`,
      relatedId: farmId,
      relatedType: 'farm',
    });

    revalidatePath('/admin/farmers');
    revalidatePath('/admin');

    return { success: true, message: `${farm.farmName} approved and verified!` };
  } catch (err) {
    console.error('[approveFarmer]', err);
    return { success: false, error: 'Failed to approve farmer.' };
  }
}

export async function rejectFarmerAction(
  farmId: string,
  reason?: string
): Promise<ActionState> {
  await requireAdmin();

  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) return { success: false, error: 'Farm not found.' };

  try {
    const adminClient = await import('@/lib/supabase/server').then(m => m.createAdminClient());
    
    // 1. Delete from Supabase Auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(farm.userId);
    if (authError) {
      console.error('[rejectFarmer] Supabase Auth Error:', authError);
      // We log but continue, in case the auth user is already gone
    }

    // 2. Cascade delete in Prisma DB
    await prisma.$transaction(async (tx) => {
      await tx.activity.deleteMany({ where: { farmId } });
      await tx.orderItem.deleteMany({ where: { product: { farmId } } });
      await tx.product.deleteMany({ where: { farmId } });
      await tx.crop.deleteMany({ where: { farmId } });
      await tx.farm.delete({ where: { id: farmId } });
      
      await tx.address.deleteMany({ where: { userId: farm.userId } });
      await tx.notification.deleteMany({ 
        where: { OR: [{ relatedId: farm.userId }, { relatedId: farmId }] } 
      });
      await tx.user.delete({ where: { id: farm.userId } });
    });

    revalidatePath('/admin/farmers');
    revalidatePath('/admin');

    return { success: true, message: `${farm.farmName} has been permanently rejected and deleted.` };
  } catch (err) {
    console.error('[rejectFarmer]', err);
    return { success: false, error: 'Failed to permanently delete farmer.' };
  }
}

// ─── Listing Moderation ───────────────────────────────────────────────────────

export async function getPendingListingsAction(page = 1, pageSize = 20) {
  await requireAdmin();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'PENDING_REVIEW' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'asc' }, // Oldest first
      include: {
        farm: {
          select: {
            farmName: true,
            barangay: true,
            status: true,
            user: { select: { name: true, email: true } },
          },
        },
        crop: { select: { cropName: true } },
      },
    }),
    prisma.product.count({ where: { status: 'PENDING_REVIEW' } }),
  ]);

  return { products, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getAllListingsAction(page = 1, pageSize = 20) {
  await requireAdmin();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        farm: {
          select: { farmName: true, user: { select: { name: true } } },
        },
      },
    }),
    prisma.product.count(),
  ]);

  return { products, total, totalPages: Math.ceil(total / pageSize) };
}

export async function approveListingAction(productId: string): Promise<ActionState> {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { farm: { select: { userId: true, farmName: true } } },
  });
  if (!product) return { success: false, error: 'Product not found.' };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'ACTIVE' },
    });

    // Notify the farmer their listing is now live
    if (product.farm?.userId) {
      sendFarmerNotification(product.farm.userId, {
        type: 'LISTING_APPROVED',
        title: '✅ Listing Approved',
        message: `Your product "${product.name}" has been approved and is now live on the marketplace.`,
        relatedId: productId,
        relatedType: 'product',
      });
    }

    revalidatePath('/admin/listings');
    revalidatePath('/products');

    return { success: true, message: `"${product.name}" is now live on the marketplace!` };
  } catch (err) {
    console.error('[approveListing]', err);
    return { success: false, error: 'Failed to approve listing.' };
  }
}

export async function removeListingAction(
  productId: string,
  reason?: string
): Promise<ActionState> {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { farm: { select: { userId: true, farmName: true } } },
  });
  if (!product) return { success: false, error: 'Product not found.' };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'REMOVED' },
    });

    // Notify the farmer their listing was removed
    if (product.farm?.userId) {
      sendFarmerNotification(product.farm.userId, {
        type: 'LISTING_REMOVED',
        title: '❌ Listing Removed',
        message: `Your product "${product.name}" has been removed from the marketplace${reason ? `: ${reason}` : '. Please review our listing guidelines.'}.`,
        relatedId: productId,
        relatedType: 'product',
      });
    }

    revalidatePath('/admin/listings');
    revalidatePath('/products');

    return { success: true, message: `"${product.name}" has been removed from the marketplace.` };
  } catch (err) {
    console.error('[removeListing]', err);
    return { success: false, error: 'Failed to remove listing.' };
  }
}

// ─── Admin Orders ─────────────────────────────────────────────────────────────

export async function getAdminOrdersAction(
  status?: string,
  page = 1,
  pageSize = 20,
  filters?: { buyer?: string; dateFrom?: string; dateTo?: string; minAmount?: number; maxAmount?: number }
) {
  await requireAdmin();

  const whereClause: any = status && status !== 'ALL' ? { orderStatus: status as 'PENDING' | 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED' } : {};

  if (filters?.buyer) {
    whereClause.buyer = {
      name: { contains: filters.buyer, mode: 'insensitive' },
    };
  }

  if (filters?.dateFrom || filters?.dateTo) {
    whereClause.createdAt = {};
    if (filters.dateFrom) {
      whereClause.createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = toDate;
    }
  }

  if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
    whereClause.totalAmount = {};
    if (filters.minAmount !== undefined && !isNaN(filters.minAmount)) {
      whereClause.totalAmount.gte = filters.minAmount;
    }
    if (filters.maxAmount !== undefined && !isNaN(filters.maxAmount)) {
      whereClause.totalAmount.lte = filters.maxAmount;
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { name: true, email: true } },
        address: { select: { barangay: true, city: true } },
        items: { take: 1, include: { product: { select: { name: true } } } },
      },
    }),
    prisma.order.count({
      where: whereClause,
    }),
  ]);

  return { orders, total, totalPages: Math.ceil(total / pageSize) };
}

export async function updateOrderStatusAdminAction(
  orderId: string,
  status: 'PENDING' | 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED',
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
): Promise<ActionState> {
  await requireAdmin();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: 'Order not found.' };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: status,
        ...(paymentStatus ? { paymentStatus } : {}),
      },
    });

    sendAdminNotification({
      type: 'ORDER_STATUS_CHANGE',
      title: 'Order Status Updated',
      message: `Order #${orderId.slice(0, 8)} was updated to ${status} by admin.`,
      relatedId: orderId,
      relatedType: 'order',
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${orderId}`);

    return { success: true, message: `Order status updated to ${status}.` };
  } catch (err) {
    console.error('[updateOrderAdmin]', err);
    return { success: false, error: 'Failed to update order status.' };
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalyticsStatsAction() {
  await requireAdmin();

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

  const [
    totalRevenueAgg,
    thisMonthRevenueAgg,
    lastMonthRevenueAgg,
    activeFarmerCount,
    newFarmerCount,
    totalHarvestVolumeAgg,
    avgOrderValueAgg,
    topCropsByCategory,
    mostActiveFarmers,
    revenueByBarangay,
    monthlyRevenueTrend,
  ] = await Promise.all([
    // Total all-time revenue from delivered + paid orders
    prisma.order.aggregate({
      where: { orderStatus: 'DELIVERED', paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    }),
    // This month revenue
    prisma.order.aggregate({
      where: {
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    // Last month revenue (for growth calc)
    prisma.order.aggregate({
      where: {
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalAmount: true },
    }),
    // Active (VERIFIED) farmer count
    prisma.farm.count({ where: { status: 'VERIFIED' } }),
    // New farmers this month
    prisma.farm.count({ where: { createdAt: { gte: startOfMonth } } }),
    // Total harvest volume in stock (kg) across all ACTIVE products
    prisma.product.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { stockKg: true },
    }),
    // Average order value (all delivered paid orders)
    prisma.order.aggregate({
      where: { orderStatus: 'DELIVERED', paymentStatus: 'PAID' },
      _avg: { totalAmount: true },
    }),
    // Top 5 product categories by number of active listings
    prisma.product.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      _sum: { stockKg: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    // Most active farmers by number of delivered orders
    prisma.farm.findMany({
      take: 5,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        products: {
          where: { status: 'ACTIVE' },
          select: {
            orderItems: {
              include: {
                order: {
                  select: { orderStatus: true, totalAmount: true },
                },
              },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        totalSales: 'desc',
      },
    }),
    // Revenue grouped by barangay (from farm locations of fulfilled orders)
    prisma.orderItem.findMany({
      where: {
        order: { orderStatus: 'DELIVERED', paymentStatus: 'PAID' },
      },
      select: {
        subtotal: true,
        product: {
          select: {
            farm: { select: { barangay: true } },
          },
        },
      },
    }),
    // Monthly revenue for the last 6 months
    prisma.order.findMany({
      where: {
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 5, 1)),
        },
      },
      select: { totalAmount: true, createdAt: true },
    }),
  ]);

  // --- Process Top Crops ---
  const topCrops = topCropsByCategory.map((c) => ({
    category: c.category,
    count: c._count.id,
    volumeKg: c._sum.stockKg ?? 0,
  }));

  // Calculate percentages for the chart (relative to the highest count)
  const maxCount = Math.max(...topCrops.map((c) => c.count), 1);
  const topCropsWithPercent = topCrops.map((c) => ({
    ...c,
    percent: Math.round((c.count / maxCount) * 100),
  }));

  // --- Process Most Active Farmers ---
  const processedFarmers = mostActiveFarmers.map((farm) => {
    let completedOrderCount = 0;
    let totalSalesAmount = 0;
    for (const product of farm.products) {
      for (const item of product.orderItems) {
        if (item.order.orderStatus === 'DELIVERED') {
          completedOrderCount++;
          totalSalesAmount += item.order.totalAmount;
        }
      }
    }
    return {
      id: farm.id,
      farmName: farm.farmName,
      barangay: farm.barangay,
      userName: farm.user?.name ?? 'Unknown',
      avatarUrl: farm.user?.avatarUrl ?? null,
      completedOrderCount,
      totalSalesAmount,
      productsListed: farm._count.products,
    };
  }).sort((a, b) => b.totalSalesAmount - a.totalSalesAmount);

  // --- Process Revenue by Barangay ---
  const barangayMap = new Map<string, number>();
  for (const item of revenueByBarangay) {
    const barangay = item.product.farm.barangay ?? 'Unknown';
    barangayMap.set(barangay, (barangayMap.get(barangay) ?? 0) + item.subtotal);
  }
  const sortedBarangays = Array.from(barangayMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxBarangayRevenue = Math.max(...sortedBarangays.map((b) => b[1]), 1);
  const revenueByBarangayProcessed = sortedBarangays.map(([name, revenue]) => ({
    name,
    revenue,
    percent: Math.round((revenue / maxBarangayRevenue) * 100),
  }));

  // --- Process Monthly Trend (last 6 months) ---
  const trendMap = new Map<string, number>();
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-PH', { month: 'short' });
    trendMap.set(key, 0);
    monthLabels.push(label);
  }
  for (const order of monthlyRevenueTrend) {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (trendMap.has(key)) {
      trendMap.set(key, (trendMap.get(key) ?? 0) + order.totalAmount);
    }
  }
  const trendValues = Array.from(trendMap.values());
  const maxTrendValue = Math.max(...trendValues, 1);
  const monthlyTrend = trendValues.map((val, idx) => ({
    label: monthLabels[idx],
    value: val,
    percent: Math.round((val / maxTrendValue) * 100),
  }));

  // --- Revenue growth calc ---
  const thisMonth = thisMonthRevenueAgg._sum.totalAmount ?? 0;
  const lastMonth = lastMonthRevenueAgg._sum.totalAmount ?? 0;
  const revenueGrowth =
    lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null;

  return {
    totalRevenue: totalRevenueAgg._sum.totalAmount ?? 0,
    thisMonthRevenue: thisMonth,
    revenueGrowth,
    activeFarmerCount,
    newFarmerCount,
    totalHarvestVolumeKg: totalHarvestVolumeAgg._sum.stockKg ?? 0,
    avgOrderValue: avgOrderValueAgg._avg.totalAmount ?? 0,
    topCrops: topCropsWithPercent,
    mostActiveFarmers: processedFarmers,
    revenueByBarangay: revenueByBarangayProcessed,
    monthlyTrend,
  };
}

// ─── Global Search ────────────────────────────────────────────────────────────

export async function globalSearchAdminAction(query: string) {
  try {
    await requireAdmin();

    if (!query || query.length < 2) return { farmers: [], products: [], orders: [], users: [] };

    const [farmers, products, orders, users] = await Promise.all([
      prisma.farm.findMany({
        where: {
          OR: [
            { farmName: { contains: query, mode: 'insensitive' } },
            { user: { name: { contains: query, mode: 'insensitive' } } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
            { barangay: { contains: query, mode: 'insensitive' } },
            { municipality: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: {
          id: true,
          farmName: true,
          user: { select: { name: true, email: true, avatarUrl: true } }
        }
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { farm: { farmName: { contains: query, mode: 'insensitive' } } }
          ],
        },
        take: 4,
        select: {
          id: true,
          name: true,
          photos: true,
          farm: { select: { farmName: true } }
        }
      }),
      prisma.order.findMany({
        where: {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { buyer: { name: { contains: query, mode: 'insensitive' } } }
          ],
        },
        take: 4,
        select: {
          id: true,
          totalAmount: true,
          buyer: { select: { name: true } },
          orderStatus: true
        }
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            // role is an enum, we can't use mode: insensitive directly on it if it's an enum, but we can search name and email.
          ],
        },
        take: 4,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true
        }
      })
    ]);

    return { farmers, products, orders, users };
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error("SEARCH ERROR:", error);
    return { farmers: [], products: [], orders: [], users: [], error: error?.message || "Unknown error" };
  }
}
