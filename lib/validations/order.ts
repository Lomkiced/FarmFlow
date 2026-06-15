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
  items: z
    .array(checkoutItemSchema)
    .min(1, 'Your cart is empty.')
    .max(20, 'Too many items in cart.'),
  notes: z.string().max(300).trim().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;