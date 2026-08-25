import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/format';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  label: string;
  hint?: ReactNode;
  icon?: string;
  className?: string;
}

/** Campo de formulário com rótulo visível, dica e foco de alto contraste. */
export function Field({ label, hint, icon, className, ...input }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[0.82rem] font-semibold text-text-soft">
        {label}
      </label>

      <div className="relative">
        {icon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.95rem] text-dim"
          >
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          aria-describedby={hintId}
          className={cx(
            'h-12 w-full rounded-lg border border-border bg-black/32 text-[0.92rem] text-text',
            'placeholder:text-dim transition-[border-color,background-color,box-shadow] duration-250',
            'hover:border-white/18 focus:border-gold/55 focus:bg-black/45 focus:shadow-[0_0_0_3px_rgba(255,197,49,.14)]',
            icon ? 'pr-4 pl-10' : 'px-4',
          )}
          {...input}
        />
      </div>

      {hint ? (
        <p id={hintId} className="text-[0.75rem] text-dim">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
