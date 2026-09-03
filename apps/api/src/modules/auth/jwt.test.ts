import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import type { JWTVerifyGetKey } from 'jose';
import { createJwtVerifier, extractBearerToken } from './jwt.js';

/**
 * Testes da verificação de token. Não tocam em rede, banco nem Supabase.
 *
 * A chave é gerada aqui e servida como se fosse o JWKS do provedor — isso
 * exercita a verificação de assinatura de verdade, em vez de simular o
 * resultado dela.
 */

const ISSUER = 'https://projeto.supabase.co/auth/v1';
const AUDIENCE = 'authenticated';
const SUBJECT = '11111111-1111-4111-8111-111111111111';

const { publicKey, privateKey } = await generateKeyPair('ES256', { extractable: true });
// Uma segunda chave, para simular token assinado por quem não deveria.
const outra = await generateKeyPair('ES256', { extractable: true });

/** Resolve sempre a chave pública legítima, como faria um JWKS de uma chave. */
const getKey: JWTVerifyGetKey = async () => publicKey;

const verify = createJwtVerifier(getKey, { issuer: ISSUER, audience: AUDIENCE });

interface TokenOptions {
  issuer?: string;
  audience?: string;
  expiresIn?: string;
  subject?: string | undefined;
  email?: string | undefined;
  userMetadata?: Record<string, unknown>;
  signWith?: Parameters<SignJWT['sign']>[0];
  omitExp?: boolean;
}

async function makeToken(options: TokenOptions = {}): Promise<string> {
  const payload: Record<string, unknown> = {
    aud: options.audience ?? AUDIENCE,
    role: 'authenticated',
  };
  if (options.email !== undefined) payload['email'] = options.email;
  if (options.userMetadata) payload['user_metadata'] = options.userMetadata;

  let jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setIssuer(options.issuer ?? ISSUER);

  if (options.subject !== undefined) jwt = jwt.setSubject(options.subject);
  if (!options.omitExp) jwt = jwt.setExpirationTime(options.expiresIn ?? '1h');

  return jwt.sign(options.signWith ?? privateKey);
}

describe('extractBearerToken', () => {
  it('extrai o token de um header bem formado', () => {
    assert.equal(extractBearerToken('Bearer abc.def.ghi'), 'abc.def.ghi');
  });

  it('aceita "bearer" em minúsculas', () => {
    assert.equal(extractBearerToken('bearer abc.def.ghi'), 'abc.def.ghi');
  });

  it('rejeita header ausente', () => {
    assert.throws(() => extractBearerToken(undefined), /MISSING_AUTHORIZATION|Authorization ausente/);
  });

  it('rejeita header malformado', () => {
    assert.throws(() => extractBearerToken('abc.def.ghi'), /malformado/);
    assert.throws(() => extractBearerToken('Basic dXNlcjpwYXNz'), /malformado/);
    assert.throws(() => extractBearerToken('Bearer'), /malformado/);
  });
});

describe('createJwtVerifier', () => {
  it('aceita um token válido e extrai as claims', async () => {
    const token = await makeToken({
      subject: SUBJECT,
      email: 'Rafael@Email.com',
      userMetadata: { full_name: 'Rafael Lima' },
    });

    const claims = await verify(token);

    assert.equal(claims.subject, SUBJECT);
    // O verificador não normaliza — quem normaliza é o serviço, antes de gravar.
    assert.equal(claims.email, 'Rafael@Email.com');
    assert.equal(claims.displayNameHint, 'Rafael Lima');
  });

  it('usa user_metadata.name quando full_name não vem', async () => {
    const token = await makeToken({ subject: SUBJECT, userMetadata: { name: 'Rafa' } });
    const claims = await verify(token);
    assert.equal(claims.displayNameHint, 'Rafa');
  });

  it('rejeita token expirado', async () => {
    const token = await makeToken({ subject: SUBJECT, expiresIn: '-1h' });
    await assert.rejects(verify(token), (error: Error & { code?: string }) => {
      assert.equal(error.code, 'TOKEN_EXPIRED');
      return true;
    });
  });

  it('rejeita assinatura de outra chave', async () => {
    const token = await makeToken({ subject: SUBJECT, signWith: outra.privateKey });
    await assert.rejects(verify(token), (error: Error & { code?: string }) => {
      assert.equal(error.code, 'INVALID_TOKEN_SIGNATURE');
      return true;
    });
  });

  it('rejeita issuer inválido', async () => {
    const token = await makeToken({ subject: SUBJECT, issuer: 'https://impostor.example/auth/v1' });
    await assert.rejects(verify(token), (error: Error & { code?: string }) => {
      assert.equal(error.code, 'INVALID_TOKEN_CLAIMS');
      return true;
    });
  });

  it('rejeita audience inválida', async () => {
    const token = await makeToken({ subject: SUBJECT, audience: 'anon' });
    await assert.rejects(verify(token), (error: Error & { code?: string }) => {
      assert.equal(error.code, 'INVALID_TOKEN_CLAIMS');
      return true;
    });
  });

  it('rejeita token sem exp — um token sem expiração valeria para sempre', async () => {
    const token = await makeToken({ subject: SUBJECT, omitExp: true });
    await assert.rejects(verify(token), (error: Error & { code?: string }) => {
      assert.equal(error.code, 'INVALID_TOKEN_CLAIMS');
      return true;
    });
  });

  it('rejeita token sem sub', async () => {
    const token = await makeToken({});
    await assert.rejects(verify(token), (error: Error & { code?: string }) => {
      assert.ok(error.code === 'INVALID_TOKEN_CLAIMS' || error.code === 'INVALID_TOKEN');
      return true;
    });
  });

  it('rejeita string que nem é um JWT', async () => {
    await assert.rejects(verify('nao-e-um-token'), (error: Error & { code?: string }) => {
      assert.equal(error.code, 'INVALID_TOKEN');
      return true;
    });
  });

  it('serve a chave pública em formato JWK, como faria o provedor', async () => {
    const jwk = await exportJWK(publicKey);
    assert.equal(jwk.kty, 'EC');
    assert.equal(jwk.crv, 'P-256');
  });
});
