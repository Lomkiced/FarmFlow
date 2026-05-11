import { z } from 'zod';

export const farmSchema = z.object({
  farmName: z.string().min(1),
  barangay: z.string().min(1),
  landArea: z.number().positive()
});