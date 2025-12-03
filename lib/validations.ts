import { z } from 'zod';
import { sanitizeText, sanitizeDescription, sanitizeUrl } from './sanitize';

/**
 * Validation schema for paper entry form with input sanitization
 * Used for creating and updating paper entries
 * Requirements: 5.3, 6.3
 */
export const paperFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be 500 characters or less')
    .transform(sanitizeText),
  
  authors: z
    .string()
    .min(1, 'Authors are required')
    .max(500, 'Authors must be 500 characters or less')
    .transform(sanitizeText),
  
  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Date must be in YYYY-MM-DD format (e.g., 2024-01-15)'
    )
    .transform((val) => val.trim()),
  
  url: z
    .string()
    .url('Must be a valid URL (e.g., https://example.com)')
    .refine(
      (url) => {
        const sanitized = sanitizeUrl(url);
        return sanitized !== null;
      },
      { message: 'URL contains invalid or dangerous content' }
    )
    .transform((url) => sanitizeUrl(url) || url),
  
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeDescription(val) : val),
  
  type: z.enum(['paper', 'blog'], {
    message: 'Type must be either "paper" or "blog"',
  }),
});

/**
 * Validation schema for admin login form with input sanitization
 * Requirements: 5.3, 6.3
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform((val) => val.trim().toLowerCase()),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .transform((val) => val.trim()),
});

/**
 * Type inference for paper form data
 */
export type PaperFormData = z.infer<typeof paperFormSchema>;

/**
 * Type inference for login form data
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Validation function for paper form data
 * Returns parsed data if valid, throws ZodError if invalid
 */
export function validatePaperForm(data: unknown): PaperFormData {
  return paperFormSchema.parse(data);
}

/**
 * Safe validation function for paper form data
 * Returns success/error result without throwing
 */
export function validatePaperFormSafe(data: unknown) {
  return paperFormSchema.safeParse(data);
}

/**
 * Validation function for login form data
 * Returns parsed data if valid, throws ZodError if invalid
 */
export function validateLogin(data: unknown): LoginFormData {
  return loginSchema.parse(data);
}

/**
 * Safe validation function for login form data
 * Returns success/error result without throwing
 */
export function validateLoginSafe(data: unknown) {
  return loginSchema.safeParse(data);
}
