import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import pg from 'pg';
import type { AuthClaims } from '../auth/jwt.js';
import { deriveDisplayName, normalizeEmail, resolvePlayer } from './service.js';

/**
 * Testes de integração — exigem um PostgreSQL real com a migration aplicada.
 *
 * Pulam automaticamente sem `TEST_DATABASE_URL`, para o CI não falhar por
 * ambiente. Mas o teste de concorrência abaixo é o que prova a invariante
 * central da fase: a Fase 2 não fecha sem ele ter rodado de verdade.
 *
 * Usa TEST_DATABASE_URL — nunca DATABASE_URL — para tornar impossível apagar
 * dados de um banco de desenvolvimento compartilhado por engano.
 */

const TEST_DATABASE_URL = process.env['TEST_DATABASE_URL'];

// Trava de segurança: com o .env sendo carregado, DATABASE_URL também está
// presente durante os testes. Apontar as duas para o mesmo banco faria a
// limpeza abaixo apagar jogadores do banco de desenvolvimento. Falha alto em
// vez de destruir dados — apagar é irreversível, um teste que não roda não é.
if (TEST_DATABASE_URL && TEST_DATABASE_URL === process.env['DATABASE_URL']) {
  throw new Error(
    'TEST_DATABASE_URL e DATABASE_URL apontam para o mesmo banco. ' +
      'Os testes de integração apagam registros: use um banco dedicado a teste.',
  );
}

const skip = TEST_DATABASE_URL
  ? false
  : 'TEST_DATABASE_URL ausente — teste de integração pulado';

let pool: pg.Pool;

const claimsFor = (subject: string, email: string, hint?: string): AuthClaims => ({
  subject,
  email,
  displayNameHint: hint,
});

describe('normalizeEmail', () => {
  it('coloca em minúsculas e remove espaços das pontas', () => {
    assert.equal(normalizeEmail('  Rafael@Email.COM  '), 'rafael@email.com');
  });
});

describe('deriveDisplayName', () => {
  it('prefere o nome informado no cadastro', () => {
    assert.equal(
      deriveDisplayName(claimsFor('s', 'x@y.com', 'Rafael Lima'), 'x@y.com'),
      'Rafael Lima',
    );
  });

  it('cai para a parte local do e-mail quando não há nome', () => {
    assert.equal(deriveDisplayName(claimsFor('s', 'rafael.lima@y.com'), 'rafael.lima@y.com'), 'Rafael Lima');
  });

  it('nunca devolve string vazia', () => {
    assert.equal(deriveDisplayName(claimsFor('s', '@y.com'), '@y.com'), 'Jogador');
  });
});

describe('resolvePlayer (integração)', { skip }, () => {
  /** Sujeitos usados pelos casos abaixo. A limpeza é restrita a eles. */
  const SUBJECTS = [
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    '55555555-5555-4555-8555-555555555555',
    '66666666-6666-4666-8666-666666666666',
    '77777777-7777-4777-8777-777777777777',
  ];

  before(async () => {
    pool = new pg.Pool({ connectionString: TEST_DATABASE_URL, max: 8 });

    // Limpeza dirigida, não TRUNCATE. Dois motivos, e nenhum é estilo:
    //
    // 1. `wallets` referencia `players` desde a Fase 3, e TRUNCATE em tabela
    //    referenciada por FK é recusado pelo Postgres. TRUNCATE ... CASCADE
    //    alcançaria wallet_entries, que é append-only e rejeita TRUNCATE.
    // 2. Apagar só os sujeitos deste arquivo remove a chance de a suíte
    //    esvaziar a tabela de players de um banco que não deveria tocar.
    await pool.query(
      'DELETE FROM wallets WHERE player_id IN (SELECT id FROM players WHERE auth_user_id = ANY($1::uuid[]))',
      [SUBJECTS],
    );
    await pool.query('DELETE FROM players WHERE auth_user_id = ANY($1::uuid[])', [SUBJECTS]);
  });

  after(async () => {
    await pool.end();
  });

  it('provisiona no primeiro acesso e devolve o mesmo player depois', async () => {
    const claims = claimsFor('22222222-2222-4222-8222-222222222222', 'Novo.Jogador@Email.com');

    const primeira = await resolvePlayer(pool, claims);
    assert.equal(primeira.provisioned, true);
    assert.equal(primeira.player.status, 'active');

    const segunda = await resolvePlayer(pool, claims);
    assert.equal(segunda.provisioned, false);
    assert.equal(segunda.player.id, primeira.player.id, 'o mesmo sub deve resolver para o mesmo player');
  });

  it('persiste o e-mail normalizado', async () => {
    const claims = claimsFor('33333333-3333-4333-8333-333333333333', '  MAIUSCULA@Email.COM  ');
    const { player } = await resolvePlayer(pool, claims);
    assert.equal(player.email, 'maiuscula@email.com');
  });

  it('requisições simultâneas do mesmo usuário criam UM único player', async () => {
    const claims = claimsFor('44444444-4444-4444-8444-444444444444', 'corrida@email.com');

    // Dispara em paralelo de verdade: é a janela entre "verificar" e
    // "inserir" que um SELECT-then-INSERT deixaria aberta.
    const resultados = await Promise.all(
      Array.from({ length: 8 }, () => resolvePlayer(pool, claims)),
    );

    const ids = new Set(resultados.map((r) => r.player.id));
    assert.equal(ids.size, 1, 'todas as requisições devem resolver para o mesmo player');

    const provisionados = resultados.filter((r) => r.provisioned).length;
    assert.equal(provisionados, 1, 'exatamente uma requisição deve ter inserido a linha');

    const { rows } = await pool.query<{ total: string }>(
      'SELECT count(*)::text AS total FROM players WHERE auth_user_id = $1',
      [claims.subject],
    );
    assert.equal(rows[0]?.total, '1', 'o banco deve conter exatamente uma linha');
  });

  it('devolve 409 quando o e-mail já pertence a outro auth_user_id', async () => {
    const email = 'duplicado@email.com';
    await resolvePlayer(pool, claimsFor('55555555-5555-4555-8555-555555555555', email));

    // Mesmo e-mail, sub diferente: conta apagada e recriada no provedor.
    await assert.rejects(
      resolvePlayer(pool, claimsFor('66666666-6666-4666-8666-666666666666', email)),
      (error: Error & { statusCode?: number; code?: string }) => {
        assert.equal(error.statusCode, 409);
        assert.equal(error.code, 'EMAIL_ALREADY_REGISTERED');
        return true;
      },
    );
  });

  it('o CHECK do banco recusa e-mail fora do padrão normalizado', async () => {
    await assert.rejects(
      pool.query(
        `INSERT INTO players (id, auth_user_id, display_name, email)
         VALUES (gen_random_uuid(), gen_random_uuid(), 'Teste', 'NAO@Normalizado.com')`,
      ),
      (error: Error & { constraint?: string }) => {
        assert.equal(error.constraint, 'players_email_normalized_check');
        return true;
      },
    );
  });

  it('rejeita provisionamento sem e-mail no token', async () => {
    await assert.rejects(
      resolvePlayer(pool, { subject: '77777777-7777-4777-8777-777777777777', email: undefined, displayNameHint: undefined }),
      (error: Error & { statusCode?: number }) => {
        assert.equal(error.statusCode, 422);
        return true;
      },
    );
  });
});
