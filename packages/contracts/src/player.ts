/**
 * Representação pública do jogador — o que a API devolve e o frontend consome.
 *
 * O que NÃO está aqui, de propósito:
 *   - `auth_user_id`: referência ao provedor de autenticação. Nunca sai da
 *     plataforma e nunca é exposto ao Vertex (ADR 0001, D3).
 *   - saldo: a wallet é da Fase 3 e tem contrato próprio.
 */

export const PLAYER_STATUSES = ['active', 'suspended', 'closed'] as const;
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const isPlayerStatus = (value: string): value is PlayerStatus =>
  (PLAYER_STATUSES as readonly string[]).includes(value);

export interface PlayerIdentity {
  /** UUID v7 da plataforma. Identificador estável usado por todo o domínio. */
  id: string;
  displayName: string;
  email: string;
  status: PlayerStatus;
  createdAt: string;
}

/** Resposta de `GET /v1/me`. */
export interface MeResponse {
  player: PlayerIdentity;
  /** true quando este request foi o que criou o player. Só informativo. */
  provisioned: boolean;
}
