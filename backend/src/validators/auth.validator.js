import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email is invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
