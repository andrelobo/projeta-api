import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'test', 'production']);

const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);

const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.url().optional());

/**
 * Contrato de configuração da API.
 *
 * Regras (SPEC-000 §4.1):
 * - ausência ou invalidade impede o boot (fail-fast);
 * - mensagens citam apenas o campo e o motivo, nunca o valor.
 */
export const envSchema = z.object({
  NODE_ENV: nodeEnvSchema.default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  MONGODB_URI: z
    .url()
    .refine(
      (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
      'deve começar com mongodb:// ou mongodb+srv://',
    ),
  REDIS_URL: z
    .url()
    .refine(
      (value) => value.startsWith('redis://') || value.startsWith('rediss://'),
      'deve começar com redis:// ou rediss://',
    ),
  CORS_ORIGIN: z.url(),
  LOG_LEVEL: logLevelSchema.default('info'),
  OTEL_EXPORTER_OTLP_ENDPOINT: optionalUrl,
});

export type AppConfig = z.infer<typeof envSchema>;

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export function loadEnv(
  source: Readonly<Record<string, string | undefined>> = process.env,
): AppConfig {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ');

    throw new ConfigValidationError(`Configuração de ambiente inválida — ${details}`);
  }

  return result.data;
}
