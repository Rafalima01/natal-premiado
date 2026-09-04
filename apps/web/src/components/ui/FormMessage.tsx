import type { ReactNode } from 'react';
import { cx } from '@/lib/format';

type Tone = 'error' | 'success' | 'info';

const tones: Record<Tone, { box: string; icon: string }> = {
  error: { box: 'border-danger/40 bg-danger/10 text-danger', icon: '⚠️' },
  success: { box: 'border-pine/40 bg-pine/12 text-pine-hi', icon: '✅' },
  info: { box: 'border-border bg-white/5 text-text-soft', icon: 'ℹ️' },
};

/**
 * Retorno de formulário. Usa os tokens de cor existentes — nenhuma cor nova.
 * `role="alert"` para leitor de tela anunciar sem o usuário precisar navegar
 * até a mensagem.
 */
export function FormMessage({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  const style = tones[tone];
  return (
    <p
      role="alert"
      className={cx(
        'flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-[0.85rem] leading-snug',
        style.box,
      )}
    >
      <span aria-hidden="true" className="shrink-0">
        {style.icon}
      </span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}
