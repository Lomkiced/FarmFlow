import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export const buyerRegisterSchema = z.object({
  name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export const farmerRegisterSchema = z.object({
  name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
  farmName: z.string().min(2, { message: 'Farm name is required.' }).trim(),
  barangay: z.string().min(1, { message: 'Please select a barangay.' }),
  landArea: z.coerce.number().positive({ message: 'Land area must be a positive number.' }),
  crops: z.array(z.string()).min(1, { message: 'Please select at least one primary crop.' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type BuyerRegisterFormValues = z.infer<typeof buyerRegisterSchema>;
export type FarmerRegisterFormValues = z.infer<typeof farmerRegisterSchema>;