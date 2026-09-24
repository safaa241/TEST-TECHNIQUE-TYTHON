import { z } from 'zod';

export const patientSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(150),
  cin: z.string().trim().min(3, 'CIN is required').max(50),
  phone: z.string().trim().min(7, 'Phone is required').max(50),
  birthDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Valid birth date is required',
  }),
  address: z.string().trim().max(255).nullable().optional(),
});

export const patientUpdateSchema = patientSchema.partial();
