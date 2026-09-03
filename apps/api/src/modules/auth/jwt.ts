import { createRemoteJWKSet, errors as joseErrors, jwtVerify } from 'jose';
import type { JWTPayload, JWTVerifyGetKey } from 'jose';
import { unauthorized } from '../../shared/errors.js';

/**
 * Camada 1 de 3: verificação do token. Função pura.
 *
 * Não conhece Fastify, não conhece banco, não conhece player. Recebe uma
 * string, devolve claims verificadas ou lança 401. É essa ausência de
 * dependências que permite testá-la com um par de chaves efêmero, sem
 * Supabase e sem rede.
 */

export interface AuthClaims {
  /** `sub` do provedor. Vira `players.auth_user_id`. */
  subject: string;
  /** `email` do token, quando presente. Ainda NÃO normalizado. */
  email: string | undefined;
  /** Nome vindo de `user_metadata`, quando o provedor mandou. */
  displayNameHint: string | undefined;
}

export interface JwtVerifierOptions {
  issuer: string;
  audience: string;
  /** Tolerância de relógio. Curta de propósito. */
  clockToleranceSeconds?: number;
}

export type VerifyAccessToken = (token: string) => Promise<AuthClaims>;

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

function extractClaims(payload: JWTPayload): AuthClaims {
  const subject = asString(payload.sub);
  if (!subject) {
    throw unauthorized('INVALID_TOKEN', 'Token sem `sub`');
  }

  // `user_metadata` é onde o Supabase coloca o que o usuário informou no
  // cadastro. É dado controlado pelo próprio usuário: serve como sugestão de
  // nome de exibição, nunca para decisão de autorização.
  const metadata =
    typeof payload.user_metadata === 'object' && payload.user_metadata !== null
      ? (payload.user_metadata as Record<string, unknown>)
      : undefined;

  return {
    subject,
    email: asString(payload.email),
    displayNameHint: asString(metadata?.['full_name']) ?? asString(metadata?.['name']),
  };
}

/**
 * Monta o verificador a partir de uma fonte de chaves qualquer.
 *
 * Receber `getKey` em vez de construir o JWKS aqui dentro é o que torna o
 * teste possível: produção passa um JWKS remoto, o teste passa uma chave local.
 */
export function createJwtVerifier(
  getKey: JWTVerifyGetKey,
  options: JwtVerifierOptions,
): VerifyAccessToken {
  return async function verifyAccessToken(token: string): Promise<AuthClaims> {
    try {
      const { payload } = await jwtVerify(token, getKey, {
        issuer: options.issuer,
        audience: options.audience,
        clockTolerance: options.clockToleranceSeconds ?? 5,
        // `exp` e `nbf` são validados pelo jose quando presentes; exigir `exp`
        // impede que um token sem expiração seja aceito para sempre.
        requiredClaims: ['sub', 'exp'],
      });

      return extractClaims(payload);
    } catch (error) {
      // Mapeia para 401 com código específico. A mensagem descreve a causa
      // sem devolver o token nem detalhe interno.
      if (error instanceof joseErrors.JWTExpired) {
        throw unauthorized('TOKEN_EXPIRED', 'Token expirado');
      }
      if (error instanceof joseErrors.JWTClaimValidationFailed) {
        throw unauthorized('INVALID_TOKEN_CLAIMS', `Claim inválida: ${error.claim}`);
      }
      if (error instanceof joseErrors.JWSSignatureVerificationFailed) {
        throw unauthorized('INVALID_TOKEN_SIGNATURE', 'Assinatura do token inválida');
      }
      if (error instanceof joseErrors.JWKSNoMatchingKey) {
        throw unauthorized('UNKNOWN_SIGNING_KEY', 'Token assinado por chave desconhecida');
      }
      // Já é um AppError vindo de extractClaims — repassa sem reembrulhar.
      if (error instanceof Error && error.name === 'AppError') {
        throw error;
      }
      throw unauthorized('INVALID_TOKEN', 'Token inválido');
    }
  };
}

export interface SupabaseJwtConfig {
  /** URL do projeto, sem barra final. Ex.: https://abc.supabase.co */
  supabaseUrl: string;
  audience: string;
}

/**
 * Verificador de produção: JWKS remoto do projeto Supabase.
 *
 * `createRemoteJWKSet` mantém cache das chaves e busca de novo quando aparece
 * um `kid` desconhecido — é o que permite ao Supabase rotacionar a chave de
 * assinatura sem redeploy da API.
 */
export function createSupabaseJwtVerifier(config: SupabaseJwtConfig): VerifyAccessToken {
  const base = config.supabaseUrl.replace(/\/+$/, '');
  const jwks = createRemoteJWKSet(new URL(`${base}/auth/v1/.well-known/jwks.json`), {
    cacheMaxAge: 10 * 60 * 1000,
    cooldownDuration: 30 * 1000,
    timeoutDuration: 5 * 1000,
  });

  return createJwtVerifier(jwks, {
    issuer: `${base}/auth/v1`,
    audience: config.audience,
  });
}

/** Extrai o token do header `Authorization: Bearer <token>`. */
export function extractBearerToken(header: string | undefined): string {
  if (!header) {
    throw unauthorized('MISSING_AUTHORIZATION', 'Header Authorization ausente');
  }
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!match?.[1]) {
    throw unauthorized('MALFORMED_AUTHORIZATION', 'Header Authorization malformado');
  }
  return match[1];
}
