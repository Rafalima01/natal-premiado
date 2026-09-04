import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '@/auth/useSession';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormMessage } from '@/components/ui/FormMessage';

export function Login() {
  const { session, loading, signIn } = useSession();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session) return <Navigate to="/perfil" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/perfil', { replace: true });
    } catch (cause) {
      // Mensagem genérica de propósito: dizer "e-mail não existe" revela
      // quais endereços têm conta na plataforma.
      setError(
        cause instanceof Error && /email not confirmed/i.test(cause.message)
          ? 'Confirme seu e-mail antes de entrar. Procure a mensagem que enviamos.'
          : 'E-mail ou senha incorretos.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Bem-vindo de volta"
      title="Entrar na sua conta"
      subtitle="O Noel guardou seu progresso. Entre e continue de onde parou."
      perks={[
        { icon: '🔥', title: 'Sua sequência continua', text: 'Volte hoje e mantenha o combo aceso.' },
        { icon: '🎁', title: 'Presente do dia esperando', text: 'Um presente novo a cada 24 horas.' },
        { icon: '🏆', title: 'Ranking do evento', text: 'Veja em que posição você está.' },
      ]}
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-gold-hi underline underline-offset-2">
            Cadastre-se e ganhe 100% de bônus
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field
          label="E-mail"
          icon="📧"
          type="email"
          name="email"
          autoComplete="username"
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
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint={
            <Link to="/login" className="text-gold-hi underline underline-offset-2">
              Esqueci minha senha
            </Link>
          }
        />

        {error ? <FormMessage tone="error">{error}</FormMessage> : null}

        <Button type="submit" variant="gold" size="lg" block icon="🔑" className="mt-1" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthShell>
  );
}
