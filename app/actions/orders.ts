'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireFarmer } from '@/lib/dal';
import {
  checkoutSchema,
  cancelOrderSchema,
  requestRefundSchema,
  resolveRefundSchema,
} from '@/lib/validations/order';
import {
  sendAdminNotification,
  sendFarmerNotification,
  sendUserNotification,
} from '@/lib/notifications';
import { formatQuantity } from '@/lib/utils';
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
    paymentMethod: formData.get('paymentMethod') || 'cod',
    items,
    notes: formData.get('notes') || undefined,
    orderType: (formData.get('orderType') as any) || 'STANDARD',
    isContract: formData.get('isContract') === 'true',
    deliveryScheduleDay: (formData.get('deliveryScheduleDay') as string) || undefined,
    contractWeeks: formData.get('contractWeeks') ? Number(formData.get('contractWeeks')) : undefined,
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

  // ── Fetch all products server-side to verify price + stock + MOQ ──────────
  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      pricePerKg: true,
      stockKg: true,
      farmId: true,
      minOrderQty: true,
      wholesalePrice: true,
      wholesaleMinQty: true,
    },
  });

  if (products.length !== productIds.length) {
    return { success: false, error: 'One or more products are no longer available.' };
  }

  // Map products for quick lookup
  const productMap = new Map(products.map((p) => [p.id, p]));
  const isContract = parsed.data.isContract ?? false;
  const weeks = isContract ? (parsed.data.contractWeeks ?? 1) : 1;

  // Build order items, enforce MOQ, verify stock, and compute wholesale pricing
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

    // Server-side MOQ enforcement:
    // If farmer set explicit MOQ > 1, enforce it. Otherwise allow fractional orders down to 0.25 (or explicit minOrderQty)
    const effectiveMinQty = (product.minOrderQty && product.minOrderQty > 1) ? product.minOrderQty : (product.minOrderQty ?? 0.25);
    if (item.quantityKg < effectiveMinQty) {
      return {
        success: false,
        error: `Minimum order quantity for "${product.name}" is ${effectiveMinQty} kg. (Your order: ${item.quantityKg} kg)`,
      };
    }

    if (product.stockKg < item.quantityKg) {
      return {
        success: false,
        error: `Insufficient stock for ${product.name}. Only ${product.stockKg} kg available.`,
      };
    }

    // Determine unit price: standard vs wholesale tier vs wholesale contract
    let unitPrice = product.pricePerKg;
    const wholesalePriceNum = product.wholesalePrice ? Number(product.wholesalePrice) : null;

    if (wholesalePriceNum && product.wholesaleMinQty && item.quantityKg >= product.wholesaleMinQty) {
      unitPrice = wholesalePriceNum;
    } else if (isContract) {
      if (wholesalePriceNum) {
        unitPrice = wholesalePriceNum;
      } else {
        // 5% wholesale contract discount on produce
        unitPrice = Math.round(product.pricePerKg * 0.95 * 100) / 100;
      }
    }

    orderItems.push({
      productId: item.productId,
      quantityKg: item.quantityKg,
      pricePerKg: unitPrice,
      subtotal: Math.round(unitPrice * item.quantityKg * 100) / 100,
    });
  }

  const subtotalPerDelivery = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const deliveryFeePerDelivery = 50;
  const totalProduceAmount = subtotalPerDelivery * weeks;
  const deliveryFee = deliveryFeePerDelivery * weeks;
  const totalAmount = totalProduceAmount + deliveryFee;

  // Calculate first delivery date for wholesale contracts
  let nextDeliveryDate: Date | null = null;
  if (isContract && parsed.data.deliveryScheduleDay) {
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    const targetDayName = parsed.data.deliveryScheduleDay.replace('Every ', '').trim();
    const targetDay = dayMap[targetDayName] ?? 6;
    const now = new Date();
    const currentDay = now.getDay();
    let diff = (targetDay - currentDay + 7) % 7;
    if (diff === 0) diff = 7;
    nextDeliveryDate = new Date(now);
    nextDeliveryDate.setDate(now.getDate() + diff);
    nextDeliveryDate.setHours(9, 0, 0, 0);
  }

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
          orderType: parsed.data.orderType || (isContract ? 'WHOLESALE_CONTRACT' : 'STANDARD'),
          isContract,
          deliveryScheduleDay: parsed.data.deliveryScheduleDay || null,
          contractWeeks: isContract ? weeks : null,
          deliveriesCompleted: 0,
          nextDeliveryDate,
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

    // Notify each farmer whose product(s) were ordered
    const farmerProductMap = new Map<string, { userId: string; productNames: string[] }>();
    for (const item of orderItems) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      // Fetch farm userId for this product's farmId
      if (!farmerProductMap.has(product.farmId)) {
        const farm = await prisma.farm.findUnique({
          where: { id: product.farmId },
          select: { userId: true },
        });
        if (farm) farmerProductMap.set(product.farmId, { userId: farm.userId, productNames: [] });
      }
      const entry = farmerProductMap.get(product.farmId);
      if (entry) {
        entry.productNames.push(product.name);
      }
    }

    for (const [, { userId, productNames }] of farmerProductMap) {
      const itemsSummary = productNames.slice(0, 2).join(', ') + (productNames.length > 2 ? ` +${productNames.length - 2} more` : '');
      sendFarmerNotification(userId, {
        type: 'NEW_CUSTOMER_ORDER',
        title: '🛍️ New Order Received!',
        message: `A customer placed an order for ${itemsSummary}. Order #${order.id.slice(0, 8)} — ₱${totalAmount.toLocaleString()}.`,
        relatedId: order.id,
        relatedType: 'order',
      });
    }

    if (parsed.data.paymentMethod === 'gcash') {
      const paymongoSecret = process.env.PAYMONGO_SECRET_KEY;
      if (!paymongoSecret || paymongoSecret.includes('your_')) {
        // Fallback or error if not configured
        console.warn('PayMongo is not configured. Falling back to COD.');
        redirect(`/order-confirmation?orderId=${order.id}`);
      } else {
        const auth = Buffer.from(`${paymongoSecret}:`).toString('base64');
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            data: {
              attributes: {
                billing: {
                  name: user.name,
                  email: user.email,
                  phone: address.phone || undefined,
                },
                send_email_receipt: true,
                show_description: true,
                show_line_items: true,
                payment_method_types: ['gcash'],
                line_items: orderItems.map(item => ({
                  name: `${productMap.get(item.productId)?.name || 'Product'} (${formatQuantity(item.quantityKg, 'kg')})${isContract ? ` (${weeks} weekly deliveries)` : ''}`,
                  amount: Math.round(item.subtotal * (isContract ? weeks : 1) * 100), // in centavos for this line item
                  currency: 'PHP',
                  quantity: 1 // Using exact item.subtotal centavos with quantity: 1 ensures precision for fractional purchases
                })).concat([{
                  name: `Delivery Fee${isContract ? ` (${weeks} weekly batches)` : ''}`,
                  amount: Math.round(deliveryFee * 100),
                  currency: 'PHP',
                  quantity: 1
                }]),
                reference_number: order.id,
                description: isContract
                  ? `FarmFlow Wholesale Contract (${weeks} wks, ${parsed.data.deliveryScheduleDay}) #${order.id.slice(0, 8)}`
                  : `FarmFlow Order #${order.id.slice(0, 8)}`,
                success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-confirmation?orderId=${order.id}&success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
              }
            }
          })
        });

        const paymongoData = await response.json();
        if (response.ok && paymongoData.data?.attributes?.checkout_url) {
          redirect(paymongoData.data.attributes.checkout_url);
        } else {
          console.error('[PayMongo Error]', paymongoData);
          return { success: false, error: 'Failed to initialize payment gateway.' };
        }
      }
    } else {
      // Redirect to order confirmation page on success for COD
      redirect(`/order-confirmation?orderId=${order.id}`);
    }

  } catch (err: unknown) {
    // redirect() throws a special error — re-throw it
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    console.error('[createOrder]', err);
    return { success: false, error: 'Failed to place order. Please try again.' };
  }
}

// ─── Record Wholesale Contract Delivery Batch (Farmer / Admin) ───────────────

/**
 * Records a single weekly delivery fulfillment for a wholesale contract.
 * Increments deliveriesCompleted and updates nextDeliveryDate (+7 days).
 * When all weeks are fulfilled, marks the order COMPLETED (and PAID if COD).
 */
export async function recordContractDeliveryAction(orderId: string): Promise<ActionState> {
  const user = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: {
              farmId: true,
              farm: { select: { id: true, userId: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  if (!order.isContract) {
    return { success: false, error: 'This order is not a wholesale contract.' };
  }

  // Farmer verification: must own at least one item
  if (user.role === 'FARMER') {
    const ownsItem = order.items.some((i) => i.product.farm?.userId === user.id);
    if (!ownsItem) {
      return { success: false, error: 'You are not authorized to manage deliveries for this contract.' };
    }
  } else if (user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized.' };
  }

  const totalWeeks = order.contractWeeks || 1;
  if (order.deliveriesCompleted >= totalWeeks) {
    return { success: false, error: 'All scheduled contract deliveries have already been fulfilled.' };
  }

  const nextCompleted = order.deliveriesCompleted + 1;
  const isFinalDelivery = nextCompleted >= totalWeeks;

  let nextDeliveryDate: Date | null = null;
  if (!isFinalDelivery) {
    const baseDate = order.nextDeliveryDate ? new Date(order.nextDeliveryDate) : new Date();
    nextDeliveryDate = new Date(baseDate);
    nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update order
      await tx.order.update({
        where: { id: orderId },
        data: {
          deliveriesCompleted: nextCompleted,
          nextDeliveryDate,
          ...(isFinalDelivery
            ? {
                orderStatus: 'DELIVERED',
                ...(order.paymentStatus === 'PENDING' ? { paymentStatus: 'PAID' } : {}),
              }
            : {
                orderStatus: 'CONFIRMED',
              }),
        },
      });

      // 2. If final delivery, credit farm sales
      if (isFinalDelivery) {
        const farmEarnings = new Map<string, number>();
        for (const item of order.items) {
          const fId = item.product.farmId;
          const current = farmEarnings.get(fId) || 0;
          farmEarnings.set(fId, current + (item.subtotal * totalWeeks));
        }
        for (const [fId, earned] of farmEarnings) {
          await tx.farm.update({
            where: { id: fId },
            data: { totalSales: { increment: earned } },
          });
        }
      }
    });

    // Notify buyer
    if (order.buyerId) {
      sendUserNotification(order.buyerId, {
        type: 'ORDER_STATUS_CHANGE',
        title: isFinalDelivery ? '🎉 Wholesale Contract Completed!' : '🚚 Weekly Wholesale Batch Delivered!',
        message: isFinalDelivery
          ? `All ${totalWeeks} weekly deliveries for Wholesale Contract #${order.id.slice(0, 8)} have been fulfilled! Thank you for supporting our local farmers!`
          : `Batch ${nextCompleted} of ${totalWeeks} has been delivered! Your next delivery is scheduled for ${nextDeliveryDate?.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}.`,
        relatedId: order.id,
        relatedType: 'order',
      });
    }

    // Notify admin
    sendAdminNotification({
      type: 'ORDER_STATUS_CHANGE',
      title: isFinalDelivery ? 'Wholesale Contract Completed' : 'Contract Delivery Batch Recorded',
      message: `Contract #${order.id.slice(0, 8)}: batch ${nextCompleted}/${totalWeeks} delivered.`,
      relatedId: order.id,
      relatedType: 'order',
    });

    revalidatePath('/farmer/orders');
    revalidatePath('/buyer/orders');
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/admin/orders');

    return {
      success: true,
      message: isFinalDelivery
        ? `Contract fully completed! All ${totalWeeks} weekly batches fulfilled.`
        : `Batch ${nextCompleted} of ${totalWeeks} recorded. Next delivery: ${nextDeliveryDate?.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}.`,
    };
  } catch (err) {
    console.error('[recordContractDeliveryAction]', err);
    return { success: false, error: 'Failed to record contract delivery.' };
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
              category: true,
              photos: true,
              farm: {
                select: {
                  id: true,
                  farmName: true,
                  barangay: true,
                  user: { select: { name: true, phone: true, avatarUrl: true } },
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
    if (newStatus === 'DELIVERED') {
      // Fetch this farmer's order items to compute their earned subtotal
      const farmerItems = await prisma.orderItem.findMany({
        where: { orderId, product: { farmId } },
        select: { subtotal: true },
      });
      const farmerSubtotal = farmerItems.reduce((sum, item) => sum + item.subtotal, 0);

      // Atomic transaction: update order + auto-complete COD payment + track sales
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            orderStatus: 'DELIVERED',
            // COD orders (paymentStatus === 'PENDING') — cash is collected on delivery
            ...(order.paymentStatus === 'PENDING' ? { paymentStatus: 'PAID' } : {}),
          },
        }),
        // Increment the farm's denormalized totalSales counter
        prisma.farm.update({
          where: { id: farmId },
          data: { totalSales: { increment: farmerSubtotal } },
        }),
      ]);
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: newStatus },
      });
    }

    sendAdminNotification({
      type: 'ORDER_STATUS_CHANGE',
      title: 'Order Status Updated',
      message: `Order #${orderId.slice(0, 8)} was marked as ${newStatus}.`,
      relatedId: orderId,
      relatedType: 'order',
    });

    revalidatePath('/farmer/orders');
    revalidatePath('/farmer/dashboard');
    revalidatePath('/farmer/farm-profile');
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
      buyer: { select: { name: true, email: true, phone: true } },
      address: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          street: true,
          barangay: true,
          city: true,
          province: true,
          zipCode: true,
        },
      },
      items: {
        where: { product: { farmId } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              photos: true,
              category: true,
            },
          },
        },
      },
    },
  });

  return orders;
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────

/**
 * Cancels an order, restores inventory atomically in a transaction,
 * and notifies all affected parties.
 */
export async function cancelOrderAction(
  orderId: string,
  reason: string
): Promise<ActionState> {
  const user = await requireAuth();

  const parseResult = cancelOrderSchema.safeParse({ orderId, reason });
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || 'Invalid cancellation data.',
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { id: true, name: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              farmId: true,
              farm: { select: { userId: true, farmName: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  // Authorization check: buyer who placed the order, farmer who owns items, or admin
  const isBuyer = user.role === 'BUYER' && order.buyerId === user.id;
  const isFarmer =
    user.role === 'FARMER' &&
    order.items.some((i) => i.product.farm?.userId === user.id);
  const isAdmin = user.role === 'ADMIN';

  if (!isBuyer && !isFarmer && !isAdmin) {
    return { success: false, error: 'You are not authorized to cancel this order.' };
  }

  // Status guard: Only PENDING or CONFIRMED orders can be cancelled
  if (order.orderStatus === 'CANCELLED') {
    return { success: false, error: 'This order is already cancelled.' };
  }

  if (order.orderStatus === 'READY' || order.orderStatus === 'DELIVERED') {
    return {
      success: false,
      error: `Orders cannot be cancelled once they are ${order.orderStatus.toLowerCase()}.`,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update order status and cancellation details
      await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'CANCELLED',
          cancelReason: reason.trim(),
          cancelledBy: user.role,
          cancelledAt: new Date(),
          ...(order.paymentStatus === 'PAID' ? { paymentStatus: 'REFUNDED' } : {}),
        },
      });

      // 2. Transaction-level Stock Restoration: increment product stock by ordered quantity
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockKg: { increment: item.quantityKg } },
        });
      }
    });

    // 3. Dispatch notifications
    const cancelledByLabel = isBuyer ? 'customer' : isFarmer ? 'farmer' : 'administrator';

    // Notify farmers
    const uniqueFarmers = new Set(
      order.items.map((i) => i.product.farm?.userId).filter(Boolean) as string[]
    );
    for (const farmerUserId of uniqueFarmers) {
      if (farmerUserId !== user.id) {
        sendFarmerNotification(farmerUserId, {
          type: 'ORDER_STATUS_CHANGE',
          title: 'Order Cancelled',
          message: `Order #${orderId.slice(0, 8)} was cancelled by the ${cancelledByLabel}. Reason: "${reason.trim()}". Stock has been restored.`,
          relatedId: orderId,
          relatedType: 'order',
        });
      }
    }

    // Notify buyer (if cancelled by someone else)
    if (!isBuyer && order.buyerId) {
      sendUserNotification(order.buyerId, {
        type: 'ORDER_STATUS_CHANGE',
        title: 'Order Cancelled',
        message: `Your Order #${orderId.slice(0, 8)} was cancelled by the ${cancelledByLabel}. Reason: "${reason.trim()}".`,
        relatedId: orderId,
        relatedType: 'order',
      });
    }

    // Notify admin
    sendAdminNotification({
      type: 'ORDER_STATUS_CHANGE',
      title: 'Order Cancelled',
      message: `Order #${orderId.slice(0, 8)} was cancelled by ${user.role}. Reason: "${reason.trim()}".`,
      relatedId: orderId,
      relatedType: 'order',
    });

    revalidatePath('/buyer/orders');
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/farmer/orders');
    revalidatePath('/farmer/dashboard');
    revalidatePath('/admin/orders');
    revalidatePath('/products');

    return {
      success: true,
      message: 'Order has been successfully cancelled and stock restored.',
    };
  } catch (err) {
    console.error('[cancelOrderAction]', err);
    return { success: false, error: 'Failed to cancel order. Please try again.' };
  }
}

// ─── Request Order Refund & Return (Buyer) ────────────────────────────────────

export async function requestOrderRefundAction(data: {
  orderId: string;
  reason: string;
  details?: string;
  proofUrl?: string;
}): Promise<ActionState> {
  const user = await requireAuth();

  const parseResult = requestRefundSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || 'Invalid refund request data.',
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: {
      buyer: { select: { id: true, name: true } },
      items: {
        include: {
          product: {
            select: {
              farmId: true,
              farm: { select: { userId: true, farmName: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  if (order.buyerId !== user.id) {
    return { success: false, error: 'Only the buyer who placed this order can request a refund.' };
  }

  if (order.orderStatus !== 'DELIVERED') {
    return {
      success: false,
      error: 'Return / refund requests can only be submitted for delivered orders.',
    };
  }

  if (order.refundStatus && order.refundStatus !== 'NONE' && order.refundStatus !== 'REJECTED') {
    return {
      success: false,
      error: `A refund request has already been ${order.refundStatus.toLowerCase()} for this order.`,
    };
  }

  try {
    await prisma.order.update({
      where: { id: data.orderId },
      data: {
        refundStatus: 'REQUESTED',
        refundReason: data.reason.trim(),
        refundDetails: data.details?.trim() || null,
        refundProofUrl: data.proofUrl || null,
        refundAmount: order.totalAmount,
        refundRequestedAt: new Date(),
        refundResolvedAt: null,
        refundAdminNote: null,
      },
    });

    // Notify farmers involved
    const uniqueFarmers = new Set(
      order.items.map((i) => i.product.farm?.userId).filter(Boolean) as string[]
    );
    for (const farmerUserId of uniqueFarmers) {
      sendFarmerNotification(farmerUserId, {
        type: 'REFUND_REQUESTED',
        title: '⚠️ Refund & Return Requested',
        message: `Customer requested a refund for Order #${order.id.slice(0, 8)}. Reason: "${data.reason.trim()}". Please review in your Orders portal.`,
        relatedId: order.id,
        relatedType: 'order',
      });
    }

    // Notify admin
    sendAdminNotification({
      type: 'REFUND_REQUESTED',
      title: '⚠️ Refund Request Submitted',
      message: `Buyer ${user.name} requested a refund for Order #${order.id.slice(0, 8)} (₱${order.totalAmount}). Reason: "${data.reason.trim()}".`,
      relatedId: order.id,
      relatedType: 'order',
    });

    revalidatePath('/buyer/orders');
    revalidatePath(`/orders/${order.id}`);
    revalidatePath('/farmer/orders');
    revalidatePath('/admin/orders');

    return {
      success: true,
      message: 'Refund request submitted successfully. The farmer/admin will review your proof.',
    };
  } catch (err) {
    console.error('[requestOrderRefundAction]', err);
    return { success: false, error: 'Failed to submit refund request.' };
  }
}

// ─── Resolve Order Refund (Farmer / Admin) ───────────────────────────────────

export async function resolveOrderRefundAction(data: {
  orderId: string;
  decision: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}): Promise<ActionState> {
  const user = await requireAuth();

  const parseResult = resolveRefundSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || 'Invalid resolution data.',
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: {
      buyer: { select: { id: true, name: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              farmId: true,
              farm: { select: { id: true, userId: true, farmName: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  const isFarmer =
    user.role === 'FARMER' &&
    order.items.some((i) => i.product.farm?.userId === user.id);
  const isAdmin = user.role === 'ADMIN';

  if (!isFarmer && !isAdmin) {
    return { success: false, error: 'Unauthorized to resolve refund for this order.' };
  }

  if (order.refundStatus !== 'REQUESTED') {
    return {
      success: false,
      error: `Order refund is currently ${order.refundStatus || 'NONE'}, not REQUESTED.`,
    };
  }

  try {
    if (data.decision === 'APPROVED') {
      // Calculate each farm's subtotal to deduct from totalSales
      const farmSubtotals = new Map<string, number>();
      for (const item of order.items) {
        const farmId = item.product.farmId;
        const current = farmSubtotals.get(farmId) || 0;
        farmSubtotals.set(farmId, current + item.subtotal);
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: data.orderId },
          data: {
            refundStatus: 'APPROVED',
            paymentStatus: 'REFUNDED',
            refundResolvedAt: new Date(),
            refundAdminNote: data.adminNote?.trim() || null,
          },
        });

        // Deduct from farm totalSales so sales analytics remain accurate
        for (const [fId, subtotal] of farmSubtotals.entries()) {
          await tx.farm.update({
            where: { id: fId },
            data: { totalSales: { decrement: subtotal } },
          });
        }
      });

      // Send notifications to buyer
      sendUserNotification(order.buyerId, {
        type: 'REFUND_APPROVED',
        title: '✅ Refund Request Approved',
        message: `Your refund request for Order #${order.id.slice(0, 8)} (₱${order.totalAmount}) has been approved.${data.adminNote ? ` Note: "${data.adminNote}"` : ''}`,
        relatedId: order.id,
        relatedType: 'order',
      });

      sendAdminNotification({
        type: 'REFUND_APPROVED',
        title: 'Refund Approved',
        message: `Refund for Order #${order.id.slice(0, 8)} was approved by ${user.role}.`,
        relatedId: order.id,
        relatedType: 'order',
      });
    } else {
      await prisma.order.update({
        where: { id: data.orderId },
        data: {
          refundStatus: 'REJECTED',
          refundResolvedAt: new Date(),
          refundAdminNote: data.adminNote?.trim() || null,
        },
      });

      // Send notifications to buyer
      sendUserNotification(order.buyerId, {
        type: 'REFUND_REJECTED',
        title: '❌ Refund Request Declined',
        message: `Your refund request for Order #${order.id.slice(0, 8)} was declined.${data.adminNote ? ` Reason: "${data.adminNote}"` : ''}`,
        relatedId: order.id,
        relatedType: 'order',
      });

      sendAdminNotification({
        type: 'REFUND_REJECTED',
        title: 'Refund Declined',
        message: `Refund for Order #${order.id.slice(0, 8)} was declined by ${user.role}.`,
        relatedId: order.id,
        relatedType: 'order',
      });
    }

    revalidatePath('/buyer/orders');
    revalidatePath(`/orders/${order.id}`);
    revalidatePath('/farmer/orders');
    revalidatePath('/farmer/dashboard');
    revalidatePath('/admin/orders');
    revalidatePath('/admin/analytics');

    return {
      success: true,
      message: `Refund request has been ${data.decision.toLowerCase()}!`,
    };
  } catch (err) {
    console.error('[resolveOrderRefundAction]', err);
    return { success: false, error: 'Failed to resolve refund request.' };
  }
}

