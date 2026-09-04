import { z } from 'zod';

/**
 * Schema do ambiente. Falha na subida, não no primeiro request.
 *
 * Regra: nenhum valor padrão para segredo. Se um segredo não veio do ambiente,
 * o processo não sobe — é preferível a um serviço no ar aceitando requisições
 * que não consegue autenticar.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),

  /** Porta. O Railway injeta PORT; localmente cai no padrão. */
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().default('0.0.0.0'),

  /** String de conexão do Postgres. Sem padrão de propósito. */
  DATABASE_URL: z.string().url(),

  /** Tamanho do pool. Ajustar conforme o limite de conexões do provedor. */
  DATABASE_POOL_MAX: z.coerce.number().int().positive().max(50).default(10),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  /**
   * URL do projeto Supabase (ex.: https://abc.supabase.co).
   * Não é segredo — aparece no bundle do frontend. Daqui saem o JWKS e o
   * issuer esperado, então um valor errado derruba toda a autenticação.
   */
  SUPABASE_URL: z.string().url(),

  /** `aud` esperada nos tokens. O Supabase emite `authenticated`. */
  SUPABASE_JWT_AUDIENCE: z.string().min(1).default('authenticated'),

  /**
   * Origens autorizadas no CORS, separadas por vírgula.
   * O frontend chama a API de outro domínio (Vercel → Railway).
   */
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    // Lista o que falta sem imprimir nenhum valor recebido — a mensagem de erro
    // de ambiente é um lugar clássico onde segredo vaza para o log.
    const problemas = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuração de ambiente inválida:\n${problemas}`);
  }

  cached = parsed.data;
  return cached;
}

export const isProduction = (env: Env) => env.NODE_ENV === 'production';
