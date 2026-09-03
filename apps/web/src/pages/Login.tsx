import { Link } from 'react-router-dom';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export function Login() {
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
      <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
        <Field
          label="E-mail ou CPF"
          icon="📧"
          type="text"
          name="usuario"
          autoComplete="username"
          placeholder="voce@email.com"
        />
        <Field
          label="Senha"
          icon="🔒"
          type="password"
          name="senha"
          autoComplete="current-password"
          placeholder="••••••••"
          hint={
            <Link to="/login" className="text-gold-hi underline underline-offset-2">
              Esqueci minha senha
            </Link>
          }
        />

        <label className="flex cursor-pointer items-center gap-2.5 text-[0.85rem] text-muted">
          <input
            type="checkbox"
            name="lembrar"
            className="size-4 rounded-xs border border-border bg-black/40 accent-[var(--color-gold)]"
          />
          Manter conectado neste dispositivo
        </label>

        <Button type="submit" variant="gold" size="lg" block icon="🔑" className="mt-1">
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}
