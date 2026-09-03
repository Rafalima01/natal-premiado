import type { Pool, PoolClient } from 'pg';

/** Executor: aceita tanto o pool quanto um client dentro de transação. */
export type Executor = Pool | PoolClient;

/** Linha crua da tabela. Não sai do módulo — vira `PlayerIdentity` no serviço. */
export interface PlayerRow {
  id: string;
  auth_user_id: string;
  display_name: string;
  email: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

const COLUMNS = 'id, auth_user_id, display_name, email, status, created_at, updated_at';

export async function findByAuthUserId(
  db: Executor,
  authUserId: string,
): Promise<PlayerRow | null> {
  const result = await db.query<PlayerRow>(
    `SELECT ${COLUMNS} FROM players WHERE auth_user_id = $1`,
    [authUserId],
  );
  return result.rows[0] ?? null;
}

export interface ProvisionInput {
  id: string;
  authUserId: string;
  displayName: string;
  email: string;
}

export interface ProvisionResult {
  row: PlayerRow;
  /** true quando esta chamada foi a que inseriu a linha. */
  inserted: boolean;
}

/**
 * Provisiona o jogador de forma idempotente.
 *
 * `ON CONFLICT ... DO UPDATE` e não `DO NOTHING`: com `DO NOTHING` o comando
 * não retorna linha quando há conflito, obrigando a um SELECT extra — e é
 * exatamente nessa janela que duas requisições simultâneas do mesmo usuário
 * divergem. Com `DO UPDATE` de um campo inócuo, o RETURNING devolve a linha
 * nos dois caminhos, em uma única ida ao banco.
 *
 * `xmax = 0` é o truque padrão do Postgres para distinguir INSERT de UPDATE
 * dentro de um upsert: em uma linha recém-inserida, `xmax` é zero.
 *
 * Se o e-mail já pertencer a OUTRO jogador, o INSERT viola
 * `players_email_key` — outra constraint, que este ON CONFLICT não trata.
 * O erro sobe com `constraint` preenchido e o serviço o traduz em 409.
 */
export async function provisionPlayer(
  db: Executor,
  input: ProvisionInput,
): Promise<ProvisionResult> {
  const result = await db.query<PlayerRow & { inserted: boolean }>(
    `INSERT INTO players (id, auth_user_id, display_name, email)
          VALUES ($1, $2, $3, $4)
     ON CONFLICT ON CONSTRAINT players_auth_user_id_key
     DO UPDATE SET updated_at = now()
       RETURNING ${COLUMNS}, (xmax = 0) AS inserted`,
    [input.id, input.authUserId, input.displayName, input.email],
  );

  const row = result.rows[0];
  if (!row) {
    // Só aconteceria se o RETURNING não devolvesse linha, o que o
    // DO UPDATE torna impossível. Falha alto em vez de seguir com undefined.
    throw new Error('provisionPlayer não retornou linha');
  }

  const { inserted, ...player } = row;
  return { row: player, inserted };
}
