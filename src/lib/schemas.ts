import * as z from 'zod';

export const SignInSchema = z.object({
  email: z.string().email({ message: 'A valid email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export const SignUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});