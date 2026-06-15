import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('paymongo-signature') || '';
    const bodyText = await req.text();

    // Verify signature
    // Signature format: t=timestamp,te=test_signature,li=live_signature
    const parsedSignature = signature.split(',').reduce((acc: Record<string, string>, curr) => {
      const [key, value] = curr.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const signatureKey = process.env.NODE_ENV === 'production' ? parsedSignature.li : parsedSignature.te;
    const timestamp = parsedSignature.t;

    const signaturePayload = `${timestamp}.${bodyText}`;
    const expectedSignature = crypto
      .createHmac('sha256', PAYMONGO_WEBHOOK_SECRET)
      .update(signaturePayload)
      .digest('hex');

    if (expectedSignature !== signatureKey && process.env.NODE_ENV === 'production') {
       return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.data;

    if (event.attributes.type === 'checkout_session.payment.paid') {
      const checkoutSession = event.attributes.data.attributes;
      const orderId = checkoutSession.reference_number;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
          },
        });
        console.log(`[PayMongo Webhook] Order ${orderId} marked as PAID`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}