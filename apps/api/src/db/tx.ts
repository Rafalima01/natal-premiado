import type { PoolClient } from 'pg';
import { getPool } from './pool.js';

/**
 * Executa uma função dentro de uma transação, com COMMIT/ROLLBACK garantidos.
 *
 * Toda operação financeira passa por aqui. O cliente é liberado no `finally`,
 * inclusive quando o callback lança — vazar cliente do pool esgota as conexões
 * e derruba o serviço de um jeito difícil de diagnosticar.
 *
 * READ COMMITTED (padrão do Postgres) é suficiente para o desenho aprovado:
 * a serialização vem do lock de linha do `UPDATE ... RETURNING`, não do nível
 * de isolamento.
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Se o ROLLBACK falhar, a conexão provavelmente já morreu. Propaga o
      // erro original, que é o que descreve a causa real.
    }
    throw error;
  } finally {
    client.release();
  }
}

/** Código de erro do Postgres para violação de unicidade. */
export const PG_UNIQUE_VIOLATION = '23505';
/** Código de erro do Postgres para violação de CHECK. */
export const PG_CHECK_VIOLATION = '23514';

export function isPgError(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  );
}
