import { Link } from 'react-router-dom';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export function Cadastro() {
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
      <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
        <Field label="Nome completo" icon="👤" type="text" name="nome" placeholder="Como no documento" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail" icon="📧" type="email" name="email" placeholder="voce@email.com" />
          <Field label="Celular" icon="📱" type="tel" name="celular" placeholder="(11) 90000-0000" />
        </div>

        <Field
          label="Senha"
          icon="🔒"
          type="password"
          name="senha"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          hint="Use letras, números e um símbolo."
        />

        <label className="flex cursor-pointer items-start gap-2.5 text-[0.82rem] leading-snug text-muted">
          <input
            type="checkbox"
            name="termos"
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

        <Button type="submit" variant="gold" size="lg" block icon="🎁" className="mt-1 shine-auto">
          Criar conta e pegar meu bônus
        </Button>
      </form>
    </AuthShell>
  );
}
