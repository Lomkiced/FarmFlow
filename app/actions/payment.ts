'use server';

import { getSessionUser } from '@/lib/dal';
import { prisma } from '@/lib/prisma';

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || '';

export async function createCheckoutSessionAction(orderId: string) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.buyerId !== user.id) {
      return { success: false, error: 'Not authorized to pay for this order' };
    }

    if (order.paymentStatus === 'PAID') {
      return { success: false, error: 'Order is already paid' };
    }

    // Prepare line items for PayMongo
    const lineItems = order.items.map((item) => ({
      currency: 'PHP',
      amount: Math.round(item.pricePerKg * 100), // PayMongo expects amount in centavos
      name: item.product.name,
      quantity: item.quantityKg,
    }));

    // Calculate subtotal from items
    const subtotal = order.items.reduce((sum, item) => sum + (item.pricePerKg * item.quantityKg), 0);
    
    // Calculate total logistics + platform fee
    const fees = order.totalAmount - subtotal;
    
    if (fees > 0) {
      lineItems.push({
        currency: 'PHP',
        amount: Math.round(fees * 100),
        name: 'Logistics and Platform Fees',
        quantity: 1,
      });
    }

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            line_items: lineItems,
            payment_method_types: ['card', 'gcash', 'paymaya', 'grab_pay'],
            description: `Payment for Order #${order.id}`,
            reference_number: order.id,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?orderId=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/cancel?orderId=${order.id}`,
          },
        },
      }),
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
    const data = await response.json();

    if (!response.ok) {
      console.error('PayMongo API Error:', data);
      return { success: false, error: data.errors?.[0]?.detail || 'Failed to create payment session' };
    }

    const checkoutUrl = data.data.attributes.checkout_url;

    // Update order with checkout session id if needed, though reference_number is better
    
    return { success: true, url: checkoutUrl };

  } catch (err) {
    console.error('[createCheckoutSession]', err);
    return { success: false, error: 'Internal server error' };
  }
}
