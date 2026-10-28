import { z } from 'zod';
import { USER_ROLES } from '../constants/roles.js';

/**
 * Validation schema for User Registration
 * Strictly permits only 'client' or 'freelancer' roles. Rejects 'admin' and any other arbitrary role.
 */
export const signupSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long'),
    role: z.enum([USER_ROLES.CLIENT, USER_ROLES.FREELANCER], {
      errorMap: () => ({ message: 'Public signup is only permitted for client or freelancer accounts' })
    })
  })
});

// Alias
export const registerSchema = signupSchema;

/**
 * Validation schema for User Login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required')
  })
});

/**
 * Validation schema for Google Authentication
 */
export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z
      .string({ required_error: 'Google ID token (or credential) is required' })
      .min(1, 'Token cannot be empty'),
    role: z
      .enum([USER_ROLES.CLIENT, USER_ROLES.FREELANCER], {
        errorMap: () => ({ message: 'Role must be either client or freelancer' })
      })
      .optional()
      .default(USER_ROLES.CLIENT)
  })
});

export default {
  signupSchema,
  registerSchema,
  loginSchema,
  googleAuthSchema
};
