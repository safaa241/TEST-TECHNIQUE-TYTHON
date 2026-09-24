import { z } from 'zod';

export const appointmentSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID'),
  appointmentDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Valid appointment date is required',
  }),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
  reason: z.string().trim().min(2, 'Reason is required').max(255),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});
