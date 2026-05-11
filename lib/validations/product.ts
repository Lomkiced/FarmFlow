import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1),
  pricePerKg: z.number().positive(),
  stockKg: z.number().positive()
});