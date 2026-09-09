import type { MeResponse, PlayerIdentity, PlayerStatus } from '@natal/contracts';
import { isPlayerStatus } from '@natal/contracts';
import type { AuthClaims } from '../auth/jwt.js';
import { PG_UNIQUE_VIOLATION, isPgError } from '../../db/tx.js';
import { conflict, unprocessable } from '../../shared/errors.js';
import { newPlayerId } from '../../shared/ids.js';
import type { Executor, PlayerRow } from './repository.js';
import { provisionPlayer } from './repository.js';

/**
 * Camada 3 de 3: traduz uma identidade autenticada em um jogador da plataforma.
 *
 * É aqui que `sub` vira `players.id`. Nenhuma outra parte do sistema deve
 * fazer essa tradução, e nada além deste módulo deve conhecer `auth_user_id`.
 */

/** Nome da constraint de e-mail. Deve casar com a migration. */
const EMAIL_CONSTRAINT = 'players_email_key';

/**
 * Normaliza o e-mail antes de persistir (ADR 0001, Ajuste D).
 * O banco tem um CHECK equivalente — a aplicação normaliza, o banco garante.
 */
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Nome de exibição para o primeiro acesso.
 *
 * Ordem: o que o usuário informou no cadastro → parte local do e-mail.
 * Não é um sistema de perfil; é um rótulo previsível para a interface não
 * ficar vazia. O jogador poderá trocar depois, em fase própria.
 */
export function deriveDisplayName(claims: AuthClaims, normalizedEmail: string): string {
  const hint = claims.displayNameHint?.trim();
  if (hint) return hint.slice(0, 80);

  const localPart = normalizedEmail.split('@')[0] ?? '';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'Jogador';

  return cleaned
    .split(/\s+/)
    .map((word) => (word[0]?.toUpperCase() ?? '') + word.slice(1))
    .join(' ')
    .slice(0, 80);
}

export function toIdentity(row: PlayerRow): PlayerIdentity {
  const status: PlayerStatus = isPlayerStatus(row.status) ? row.status : 'suspended';
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    status,
    createdAt: row.created_at.toISOString(),
  };
}

/**
 * Resolve — e provisiona quando necessário — o jogador do token.
 *
 * Idempotente: o mesmo `sub` sempre devolve o mesmo `players.id`, inclusive
 * sob requisições simultâneas. A garantia vem do índice único em
 * `auth_user_id` combinado com o upsert, não de uma checagem na aplicação.
 */
export async function resolvePlayer(db: Executor, claims: AuthClaims): Promise<MeResponse> {
  if (!claims.email) {
    // Sem e-mail não dá para provisionar: a coluna é NOT NULL e é o que
    // identifica a pessoa nas telas administrativas.
    throw unprocessable('EMAIL_REQUIRED', 'O token não traz e-mail; não é possível provisionar');
  }

  const email = normalizeEmail(claims.email);
  const displayName = deriveDisplayName(claims, email);

  try {
    const { row, inserted } = await provisionPlayer(db, {
      id: newPlayerId(),
      authUserId: claims.subject,
      displayName,
      email,
    });

    return { player: toIdentity(row), provisioned: inserted };
  } catch (error) {
    // Distingue a constraint específica: nem todo 23505 é colisão de e-mail.
    // Acontece de verdade quando alguém apaga a conta no provedor e recria
    // com o mesmo e-mail — o `sub` é novo, o e-mail não.
    if (isPgError(error, PG_UNIQUE_VIOLATION)) {
      const constraint = (error as { constraint?: string }).constraint;
      if (constraint === EMAIL_CONSTRAINT) {
        throw conflict(
          'EMAIL_ALREADY_REGISTERED',
          'Este e-mail já pertence a outro jogador. É necessária verificação manual.',
        );
      }
    }
    throw error;
  }
}
