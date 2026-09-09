import type { Executor } from '../players/repository.js';

/**
 * Verifica que o schema financeiro existe no banco apontado.
 *
 * Existe para transformar um erro cru do Postgres ("relation wallets does not
 * exist", com stack de parse_relation.c) em uma instrução do que fazer. Sem
 * isso, apontar a suíte para um banco sem as migrations produz uma falha que
 * parece bug de código e é, na verdade, ambiente errado.
 *
 * Não pula nada: lança. A decisão P4 do ADR 0002 tirou o banco remoto
 * gerenciado do caminho dos testes financeiros, e um banco sem as tabelas é
 * exatamente o sintoma de estar apontando para o lugar errado.
 */
export async function assertFinancialSchema(db: Executor): Promise<void> {
  const result = await db.query<{ missing: string[] }>(
    `SELECT array_agg(t) AS missing
       FROM unnest(ARRAY['wallets', 'ledger_operations', 'wallet_entries']) AS t
      WHERE to_regclass('public.' || t) IS NULL`,
  );

  const missing = result.rows[0]?.missing;
  if (missing && missing.length > 0) {
    throw new Error(
      `O banco de teste não tem o schema financeiro (faltam: ${missing.join(', ')}). ` +
        'Rode `npm run test:financial --workspace @natal/api`, que sobe um PostgreSQL efêmero e ' +
        'aplica as migrations. Se TEST_DATABASE_URL no seu .env aponta para o Supabase remoto, ' +
        'remova essa linha: a decisão P4 do ADR 0002 tirou o banco gerenciado dos testes financeiros.',
    );
  }
}
