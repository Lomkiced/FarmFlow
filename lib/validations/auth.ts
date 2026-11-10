import { z } from 'zod';
import { AGOO_BARANGAYS } from '@/lib/constants/locations';
import { KYC_ID_OPTIONS, verifyIdentityMatch, isValidRsbsaNumber } from '@/lib/kyc-utils';

export const VALID_ID_TYPES = KYC_ID_OPTIONS.map((o) => o.code) as unknown as readonly [
  string,
  ...string[]
];

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export const buyerRegisterSchema = z
  .object({
    name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).trim(),
    email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
    phone: z.string().optional(),
    idType: z.string().min(1, { message: 'Please select a valid ID type.' }),
    idNumber: z.string().min(1, { message: 'ID number is required.' }).trim(),
    confirmIdNumber: z.string().min(1, { message: 'Please re-enter your ID number to confirm.' }).trim(),
    idNameOnDocument: z.string().min(2, { message: 'Full name as shown on ID is required.' }).trim(),
    idPhotoUrl: z.string().min(1, { message: 'A valid government ID document/photo is required.' }).trim(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      });
    }

    const kycCheck = verifyIdentityMatch({
      registeredName: data.name,
      idNameOnDocument: data.idNameOnDocument,
      idType: data.idType,
      idNumber: data.idNumber,
      confirmIdNumber: data.confirmIdNumber,
      requireRsbsa: false,
      hasUploadedDocument: Boolean(data.idPhotoUrl),
    });

    if (kycCheck.errors.idNameOnDocument) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: kycCheck.errors.idNameOnDocument,
        path: ['idNameOnDocument'],
      });
    }
    if (kycCheck.errors.idNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: kycCheck.errors.idNumber,
        path: ['idNumber'],
      });
    }
    if (kycCheck.errors.confirmIdNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: kycCheck.errors.confirmIdNumber,
        path: ['confirmIdNumber'],
      });
    }
  });

export const farmerRegisterSchema = z
  .object({
    name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).trim(),
    email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
    phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
    farmName: z.string().min(2, { message: 'Farm name is required.' }).trim(),
    barangay: z.enum(AGOO_BARANGAYS, {
      error: 'Please select a valid Agoo barangay.',
    }),
    landArea: z.coerce.number().positive({ message: 'Land area must be a positive number.' }),
    crops: z.array(z.string()).min(1, { message: 'Please select at least one primary crop.' }),
    rsbsaNumber: z
      .string()
      .min(1, { message: 'RSBSA Registration Number is required for Farmers.' })
      .trim()
      .refine((val) => isValidRsbsaNumber(val), {
        message: 'RSBSA Number must follow format XX-XX-XX-XXX-XXXXXX (e.g., 01-33-02-001-000123).',
      }),
    idType: z.string().min(1, { message: 'Please select a valid ID type.' }),
    idNumber: z.string().min(1, { message: 'ID number is required.' }).trim(),
    confirmIdNumber: z.string().min(1, { message: 'Please re-enter your ID number to confirm.' }).trim(),
    idNameOnDocument: z.string().min(2, { message: 'Full name as shown on ID is required.' }).trim(),
    idPhotoUrl: z.string().min(1, { message: 'A valid government or RSBSA ID photo is required.' }).trim(),
    farmDocUrl: z.string().optional(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      });
    }

    const kycCheck = verifyIdentityMatch({
      registeredName: data.name,
      idNameOnDocument: data.idNameOnDocument,
      idType: data.idType,
      idNumber: data.idNumber,
      confirmIdNumber: data.confirmIdNumber,
      rsbsaNumber: data.rsbsaNumber,
      requireRsbsa: true,
      hasUploadedDocument: Boolean(data.idPhotoUrl),
    });

    if (kycCheck.errors.idNameOnDocument) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: kycCheck.errors.idNameOnDocument,
        path: ['idNameOnDocument'],
      });
    }
    if (kycCheck.errors.idNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: kycCheck.errors.idNumber,
        path: ['idNumber'],
      });
    }
    if (kycCheck.errors.confirmIdNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: kycCheck.errors.confirmIdNumber,
        path: ['confirmIdNumber'],
      });
    }
    if (kycCheck.errors.rsbsaNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: kycCheck.errors.rsbsaNumber,
        path: ['rsbsaNumber'],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type BuyerRegisterFormValues = z.infer<typeof buyerRegisterSchema>;
export type FarmerRegisterFormValues = z.infer<typeof farmerRegisterSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
