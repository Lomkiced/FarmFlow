'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/dal';
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
  pageSize = 20
) {
  await requireAdmin();

  const [farmers, total] = await Promise.all([
    prisma.farm.findMany({
      where: status ? { status } : {},
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
        _count: { select: { crops: true, products: true } },
      },
    }),
    prisma.farm.count({ where: status ? { status } : {} }),
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
    await prisma.farm.update({
      where: { id: farmId },
      data: { status: 'SUSPENDED' },
    });

    revalidatePath('/admin/farmers');
    revalidatePath('/admin');

    return { success: true, message: `${farm.farmName} has been suspended.` };
  } catch (err) {
    console.error('[rejectFarmer]', err);
    return { success: false, error: 'Failed to reject farmer.' };
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

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { success: false, error: 'Product not found.' };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'ACTIVE' },
    });

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

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { success: false, error: 'Product not found.' };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'REMOVED' },
    });

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
  pageSize = 20
) {
  await requireAdmin();

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: status ? { orderStatus: status as 'PENDING' | 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED' } : {},
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
      where: status ? { orderStatus: status as 'PENDING' | 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED' } : {},
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

    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${orderId}`);

    return { success: true, message: `Order status updated to ${status}.` };
  } catch (err) {
    console.error('[updateOrderAdmin]', err);
    return { success: false, error: 'Failed to update order status.' };
  }
}
