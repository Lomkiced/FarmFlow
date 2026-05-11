import { z } from 'zod';

export const orderSchema = z.object({
  addressId: z.string().uuid(),
  notes: z.string().optional()
});