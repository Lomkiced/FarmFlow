import { z } from 'zod';

export const orderSchema = z.object({
  addressId: z.string().uuid('Please select a valid delivery address.'),
  notes: z.string().max(300, 'Notes must be at most 300 characters.').trim().optional(),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['PENDING', 'CONFIRMED', 'READY', 'DELIVERED', 'CANCELLED']),
});

// Cart items submitted from client for server-side verification
export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantityKg: z.number().positive('Quantity must be greater than 0.').multipleOf(0.1),
});

export const checkoutSchema = z.object({
  addressId: z.string().uuid('Please select a valid delivery address.'),
  paymentMethod: z.enum(['cod', 'gcash']).default('cod'),
  items: z
    .array(checkoutItemSchema)
    .min(1, 'Your cart is empty.')
    .max(20, 'Too many items in cart.'),
  notes: z.string().max(300).trim().optional(),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid('Invalid order ID.'),
  reason: z.string().min(3, 'Please provide a cancellation reason.').max(500, 'Reason cannot exceed 500 characters.').trim(),
});

export const requestRefundSchema = z.object({
  orderId: z.string().uuid('Invalid order ID.'),
  reason: z.string().min(3, 'Please provide a refund reason.').max(200, 'Reason cannot exceed 200 characters.').trim(),
  details: z.string().max(1000, 'Details cannot exceed 1000 characters.').trim().optional(),
  proofUrl: z.string().url('Proof photo URL is required for refund verification.').optional(),
});

export const resolveRefundSchema = z.object({
  orderId: z.string().uuid('Invalid order ID.'),
  decision: z.enum(['APPROVED', 'REJECTED']),
  adminNote: z.string().max(500, 'Note cannot exceed 500 characters.').trim().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type CancelOrderValues = z.infer<typeof cancelOrderSchema>;
export type RequestRefundValues = z.infer<typeof requestRefundSchema>;
export type ResolveRefundValues = z.infer<typeof resolveRefundSchema>;