import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().trim().optional(),
  fullName: z.string().min(2, 'Full name is required.').trim(),
  phone: z
    .string()
    .min(10, 'Please enter a valid Philippine phone number.')
    .regex(/^(09|\+639)\d{9}$/, 'Phone must be a valid Philippine mobile number (e.g., 09123456789).')
    .trim(),
  street: z.string().min(1, 'Street address is required.').trim(),
  barangay: z.string().min(1, 'Barangay is required.').trim(),
  city: z.string().min(1, 'City/Municipality is required.').trim(),
  province: z.string().min(1, 'Province is required.').trim(),
  zipCode: z.string().trim().optional(),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
