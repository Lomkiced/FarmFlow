'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireFarmer } from '@/lib/dal';
import { checkoutSchema } from '@/lib/validations/order';
import { sendAdminNotification } from '@/lib/notifications';
import type { ActionState } from './crops';

// ─── Create Order (Checkout) ──────────────────────────────────────────────────

/**
 * Creates an order from the buyer's cart.
 * - Verifies all products exist and have sufficient stock.
 * - Calculates prices server-side (never trusts client-submitted prices).
 * - Creates Order + OrderItems + decrements stock atomically.
 */
export async function createOrderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();

  if (user.role !== 'BUYER') {
    return { success: false, error: 'Only buyers can place orders.' };
  }

  // Parse cart items from the form
  let items: Array<{ productId: string; quantityKg: number }> = [];
  const itemsRaw = formData.get('items');
  if (!itemsRaw) return { success: false, error: 'Your cart is empty.' };

  try {
    items = JSON.parse(itemsRaw as string);
  } catch {
    return { success: false, error: 'Invalid cart data.' };
  }

  const raw = {
    addressId: formData.get('addressId'),
    items,
    notes: formData.get('notes') || undefined,
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // ── Verify address belongs to buyer ───────────────────────────────────────
  const address = await prisma.address.findFirst({
    where: { id: parsed.data.addressId, userId: user.id },
  });
  if (!address) {
    return { success: false, error: 'Invalid delivery address.' };
  }

  // ── Fetch all products server-side to verify price + stock ────────────────
  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: 'ACTIVE' },
    select: { id: true, name: true, pricePerKg: true, stockKg: true, farmId: true },
  });

  if (products.length !== productIds.length) {
    return { success: false, error: 'One or more products are no longer available.' };
  }

  // Map products for quick lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Build order items and verify stock
  const orderItems: Array<{
    productId: string;
    quantityKg: number;
    pricePerKg: number;
    subtotal: number;
  }> = [];

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { success: false, error: `Product not found: ${item.productId}` };
    }
    if (product.stockKg < item.quantityKg) {
      return {
        success: false,
        error: `Insufficient stock for ${product.name}. Only ${product.stockKg} kg available.`,
      };
    }

    orderItems.push({
      productId: item.productId,
      quantityKg: item.quantityKg,
      pricePerKg: product.pricePerKg, // ← Server-computed price, not client price!
      subtotal: product.pricePerKg * item.quantityKg,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const deliveryFee = 50; // Fixed delivery fee — can be made dynamic later
  const totalAmount = subtotal + deliveryFee;

  // ── Atomic transaction: create order + update stock ────────────────────────
  try {
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          buyerId: user.id,
          totalAmount,
          deliveryFee,
          orderStatus: 'PENDING',
          paymentStatus: 'PENDING',
          addressId: parsed.data.addressId,
          notes: parsed.data.notes,
          items: {
            create: orderItems,
          },
        },
      });

      // Decrement stock for each product atomically
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockKg: { decrement: item.quantityKg } },
        });
      }

      return newOrder;
    });

    revalidatePath('/products');

    sendAdminNotification({
      type: 'NEW_ORDER',
      title: 'New Order Placed',
      message: `Order #${order.id.slice(0, 8)} was placed for ₱${totalAmount}.`,
      relatedId: order.id,
      relatedType: 'order',
    });

    // Redirect to order tracking on success
    redirect(`/orders/${order.id}`);
  } catch (err: unknown) {
    // redirect() throws a special error — re-throw it
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    console.error('[createOrder]', err);
    return { success: false, error: 'Failed to place order. Please try again.' };
  }
}

// ─── Get Buyer Orders ─────────────────────────────────────────────────────────

export async function getBuyerOrdersAction() {
  const user = await requireAuth();

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      address: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
              photos: true,
              farm: {
                select: { farmName: true, user: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });

  return orders;
}

// ─── Get Single Order ─────────────────────────────────────────────────────────

export async function getOrderAction(orderId: string) {
  const user = await requireAuth();

  // Buyers can see their own orders; farmers can see orders for their products
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...(user.role === 'BUYER'
        ? { buyerId: user.id }
        : user.role === 'FARMER'
        ? { items: { some: { product: { farm: { userId: user.id } } } } }
        : {}), // ADMIN can see all
    },
    include: {
      buyer: { select: { name: true, email: true, phone: true } },
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              photos: true,
              farm: {
                select: {
                  id: true,
                  farmName: true,
                  user: { select: { name: true, avatarUrl: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return order;
}

// ─── Update Order Status (Farmer) ─────────────────────────────────────────────

/**
 * Transitions order status. Only the farmer who owns the product can move
 * PENDING → CONFIRMED → READY. DELIVERED is also allowed.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED'
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  // Verify farmer owns at least one product in this order
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      items: { some: { product: { farmId } } },
    },
  });

  if (!order) {
    return { success: false, error: 'Order not found or access denied.' };
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['READY', 'CANCELLED'],
    READY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  const allowed = validTransitions[order.orderStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${order.orderStatus} to ${newStatus}.`,
    };
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    sendAdminNotification({
      type: 'ORDER_STATUS_CHANGE',
      title: 'Order Status Updated',
      message: `Order #${orderId.slice(0, 8)} was marked as ${newStatus}.`,
      relatedId: orderId,
      relatedType: 'order',
    });

    revalidatePath('/farmer/orders');
    revalidatePath(`/orders/${orderId}`);

    return { success: true, message: `Order marked as ${newStatus.toLowerCase()}.` };
  } catch (err) {
    console.error('[updateOrderStatus]', err);
    return { success: false, error: 'Failed to update order status.' };
  }
}

// ─── Get Farmer Orders ────────────────────────────────────────────────────────

export async function getFarmerOrdersAction(
  status?: 'PENDING' | 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED'
) {
  const { farmId } = await requireFarmer();

  const orders = await prisma.order.findMany({
    where: {
      items: { some: { product: { farmId } } },
      ...(status ? { orderStatus: status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: { select: { name: true, phone: true } },
      address: { select: { street: true, barangay: true, city: true } },
      items: {
        where: { product: { farmId } },
        include: {
          product: { select: { name: true, photos: true } },
        },
      },
    },
  });

  return orders;
}
