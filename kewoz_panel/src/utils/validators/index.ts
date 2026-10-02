import * as z from 'zod';

type ValidationResult<T> = 
  | { valid: true; data: T; errors: null }
  | { valid: false; data: null; errors: Record<string, string> };

// Common validation schemas
export const schemas = {
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  url: z.string().url('Invalid URL'),
};

// Form schemas
export const formSchemas = {
  login: z.object({
    email: schemas.email,
    password: z.string().min(1, 'Required'),
    remember: z.boolean().optional(),
  }),
  
  register: z.object({
    email: schemas.email,
    password: schemas.password,
    confirmPassword: z.string(),
    name: z.string().min(2, 'Too short'),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
};

// Validate data against schema
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  try {
    return { 
      valid: true, 
      data: schema.parse(data), 
      errors: null 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.format();
      
      return { valid: false, data: null, errors };
    }
    throw error;
  }
}

// Common validation rules
export const rules = {
  required: (value: unknown) => !value && 'Required',
  minLength: (min: number) => (value: string) => 
    value.length < min && `Min ${min} characters`,
  email: (value: string) => 
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && 'Invalid email',
};

// Compose multiple validators
export const composeValidators = (...validators: any[]) => 
  (value: any, allValues: any) =>
    validators.reduce((error, validator) => 
      error || validator(value, allValues), undefined);

// Types
export type LoginForm = z.infer<typeof formSchemas.login>;
export type RegisterForm = z.infer<typeof formSchemas.register>;
