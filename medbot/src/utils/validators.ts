import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

export const profileFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  age: z.number().positive().min(1, 'Age must be a valid number'),
  emergencyContact: z.string().min(10, 'Valid emergency contact is required')
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
