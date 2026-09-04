import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSession } from '@/auth/useSession';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormMessage } from '@/components/ui/FormMessage';

export function Cadastro() {
  const { session, loading, signUp } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  if (!loading && session) return <Navigate to="/perfil" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUp(email, password, name);

      // Com confirmação ligada, não existe sessão ainda — e portanto nenhum
      // player foi criado. O jogador só é provisionado no primeiro acesso
      // autenticado a `/v1/me`, depois de confirmar o e-mail.
      if (needsEmailConfirmation) {
        setAwaitingConfirmation(true);
      }
    } catch (cause) {
      setError(
        cause instanceof Error && /already registered|already exists/i.test(cause.message)
          ? 'Já existe uma conta com este e-mail. Tente entrar.'
          : 'Não foi possível criar a conta. Confira os dados e tente de novo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Leva menos de um minuto"
      title="Criar sua conta"
      subtitle="Cadastre-se, receba o bônus de Natal de 100% e comece a raspar hoje mesmo."
      perks={[
        { icon: '💯', title: 'Bônus de 100%', text: 'Dobramos seu primeiro depósito, até R$ 500.' },
        { icon: '🎟️', title: 'Cartela grátis', text: 'Uma raspadinha por nossa conta na entrada.' },
        { icon: '⚡', title: 'Saque via PIX', text: 'Prêmio em dinheiro sai em minutos.' },
      ]}
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-gold-hi underline underline-offset-2">
            Entrar agora
          </Link>
        </>
      }
    >
      {awaitingConfirmation ? (
        <div className="flex flex-col gap-4">
          <FormMessage tone="success">
            Conta criada. Enviamos um e-mail de confirmação para{' '}
            <strong className="font-semibold">{email.trim().toLowerCase()}</strong> — confirme para
            poder entrar.
          </FormMessage>
          <p className="text-[0.85rem] text-muted">
            Não chegou? Verifique a caixa de spam. O link vale por tempo limitado.
          </p>
          <Button to="/login" variant="ghost" size="lg" block>
            Ir para o login
          </Button>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field
            label="Nome completo"
            icon="👤"
            type="text"
            name="nome"
            autoComplete="name"
            placeholder="Como no documento"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="E-mail"
              icon="📧"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="voce@email.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Field
              label="Senha"
              icon="🔒"
              type="password"
              name="senha"
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-[0.82rem] leading-snug text-muted">
            <input
              type="checkbox"
              name="termos"
              required
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded-xs border border-border bg-black/40 accent-[var(--color-gold)]"
            />
            <span>
              Tenho 18 anos ou mais e aceito os{' '}
              <Link to="/termos" className="text-gold-hi underline underline-offset-2">
                Termos de uso
              </Link>{' '}
              e a{' '}
              <Link to="/privacidade" className="text-gold-hi underline underline-offset-2">
                Política de privacidade
              </Link>
              .
            </span>
          </label>

          {error ? <FormMessage tone="error">{error}</FormMessage> : null}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            block
            icon="🎁"
            className="mt-1 shine-auto"
            disabled={submitting || !accepted}
          >
            {submitting ? 'Criando conta…' : 'Criar conta e pegar meu bônus'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
