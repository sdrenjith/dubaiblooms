import { config } from 'dotenv';
import { z } from 'zod';

config();

function parseCorsOriginList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const urlSchema = z.string().url();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    MONGODB_URI: z
      .string()
      .min(1)
      .refine(
        (v) => v.startsWith('mongodb://') || v.startsWith('mongodb+srv://'),
        'MONGODB_URI must start with mongodb:// or mongodb+srv://'
      ),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1).default('7d'),
    /** Comma-separated browser origins, e.g. `https://dubaiblooms.ae,https://www.dubaiblooms.ae` */
    CORS_ORIGIN: z.string().optional(),
    API_RATE_LIMIT_MAX: z.coerce.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    const origins = parseCorsOriginList(data.CORS_ORIGIN);
    for (let i = 0; i < origins.length; i++) {
      const r = urlSchema.safeParse(origins[i]);
      if (!r.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid URL in CORS_ORIGIN list: ${origins[i]}`,
          path: ['CORS_ORIGIN'],
        });
      }
    }
    if (data.NODE_ENV === 'production') {
      if (origins.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CORS_ORIGIN is required when NODE_ENV is production (one or more comma-separated URLs)',
          path: ['CORS_ORIGIN'],
        });
      }
      if (data.JWT_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'JWT_SECRET must be at least 32 characters in production',
          path: ['JWT_SECRET'],
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Environment validation failed:');
    const flat = result.error.flatten();
    console.error(JSON.stringify(flat.fieldErrors, null, 2));
    for (const issue of result.error.issues) {
      console.error(`- ${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();

/** Allowed browser origins (from comma-separated `CORS_ORIGIN`). */
export function getCorsOrigins(): string[] {
  return parseCorsOriginList(env.CORS_ORIGIN);
}

/** Canonical public URL for sitemap, password-reset links, etc. */
export function getPublicBaseUrl(): string {
  const list = getCorsOrigins();
  if (list.length > 0) return list[0]!;
  return 'http://localhost:5173';
}
