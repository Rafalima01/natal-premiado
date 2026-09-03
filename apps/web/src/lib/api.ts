import { requireSupabase } from './supabase';

/**
 * Cliente da API da plataforma.
 *
 * Toda chamada autenticada leva o access token do Supabase no header
 * `Authorization`. O backend verifica esse token contra o JWKS do provedor —
 * o frontend nunca afirma quem é o usuário, apenas repassa a prova.
 */

const baseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Anexa o token da sessão atual. Padrão: true. */
  authenticated?: boolean;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, authenticated = true, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (authenticated) {
    // `getSession` renova o token quando está perto de expirar, então o
    // header sempre sai com um token válido.
    const { data } = await requireSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      throw new ApiError(401, 'NO_SESSION', 'Sem sessão ativa');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(signal ? { signal } : {}),
  });

  if (!response.ok) {
    let code = 'REQUEST_FAILED';
    let message = `Falha na requisição (${response.status})`;
    try {
      const parsed = (await response.json()) as ApiErrorBody;
      if (parsed.error?.code) code = parsed.error.code;
      if (parsed.error?.message) message = parsed.error.message;
    } catch {
      // Resposta sem JSON — mantém a mensagem genérica.
    }
    throw new ApiError(response.status, code, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
