import pg from 'pg';
import type { Env } from '../config/env.js';

/**
 * Pool de conexões. Um por processo.
 *
 * Nota sobre tipos: o driver `pg` devolve BIGINT (OID 20) como string por
 * padrão, para não perder precisão além de 2^53. Isso é o comportamento
 * correto para colunas monetárias e **não deve ser alterado globalmente**.
 * A conversão para number acontece na borda do módulo wallet, com validação,
 * quando as tabelas financeiras existirem (Fase 3).
 */

let pool: pg.Pool | undefined;

export function createPool(env: Env): pg.Pool {
  if (pool) return pool;

  pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    // O provedor gerenciado termina TLS na borda; em desenvolvimento local
    // não há TLS. `ssl` fica a cargo da própria connection string
    // (`?sslmode=require`), mantendo o código portável entre provedores.
  });

  pool.on('error', (error) => {
    // Erro em cliente ocioso do pool não pode derrubar o processo.
    // eslint-disable-next-line no-console
    console.error('[db] erro em cliente ocioso do pool:', error.message);
  });

  return pool;
}

export function getPool(): pg.Pool {
  if (!pool) throw new Error('Pool não inicializado. Chame createPool primeiro.');
  return pool;
}

export async function closePool(): Promise<void> {
  if (!pool) return;
  await pool.end();
  pool = undefined;
}

/** Verifica se o banco responde. Usado pelo readiness probe. */
export async function pingDatabase(): Promise<boolean> {
  const result = await getPool().query('select 1 as ok');
  return result.rows[0]?.ok === 1;
}
