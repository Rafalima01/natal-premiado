import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '@/lib/format';

export type ButtonVariant = 'gold' | 'festive' | 'pine' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  icon?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
}

interface ButtonProps extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  to?: undefined;
}

interface LinkProps extends BaseProps {
  to: string;
  /** links externos abrem em nova aba */
  external?: boolean;
}

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold ' +
  'select-none whitespace-nowrap transition-[transform,box-shadow,filter] duration-250 ease-[var(--ease-out-quint)] ' +
  'active:translate-y-px active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50';

const variants: Record<ButtonVariant, string> = {
  gold:
    'text-bordo-deep bg-[linear-gradient(180deg,#fff0bd_0%,var(--color-gold-hi)_18%,var(--color-gold)_52%,var(--color-gold-deep)_100%)] ' +
    'shadow-[0_1px_0_rgba(255,255,255,.7)_inset,0_-2px_0_rgba(122,80,4,.55)_inset,0_10px_26px_-8px_rgba(255,197,49,.7)] ' +
    'hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_-2px_0_rgba(122,80,4,.5)_inset,0_16px_34px_-8px_rgba(255,197,49,.85)]',
  festive:
    'text-white bg-[linear-gradient(180deg,#ff8093_0%,var(--color-primary-hi)_20%,var(--color-primary)_55%,var(--color-primary-deep)_100%)] ' +
    'shadow-[0_1px_0_rgba(255,255,255,.35)_inset,0_-2px_0_rgba(90,6,20,.6)_inset,0_10px_26px_-8px_rgba(224,27,51,.75)] ' +
    'hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,.45)_inset,0_-2px_0_rgba(90,6,20,.55)_inset,0_16px_34px_-8px_rgba(224,27,51,.9)]',
  pine:
    'text-bordo-deep bg-[linear-gradient(180deg,#8bf7c4_0%,var(--color-pine-hi)_22%,#1fb972_60%,var(--color-pine-deep)_100%)] ' +
    'shadow-[0_1px_0_rgba(255,255,255,.5)_inset,0_-2px_0_rgba(6,50,30,.5)_inset,0_10px_26px_-8px_rgba(47,212,131,.65)] ' +
    'hover:-translate-y-0.5',
  ghost:
    'text-text-soft bg-white/6 backdrop-blur-md border border-white/10 ' +
    'hover:bg-white/12 hover:border-white/20 hover:-translate-y-0.5',
  outline:
    'text-gold border border-gold/45 bg-gold/6 hover:bg-gold/14 hover:border-gold/70 hover:-translate-y-0.5',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.8rem] tracking-[0.01em]',
  md: 'h-11 px-5 text-[0.92rem]',
  lg: 'h-14 px-8 text-[1.05rem]',
};

/**
 * Classes do botão sem o elemento — para quando o "botão" precisa ser um
 * `<span>` (ex.: dentro de um card que já é inteiro um link).
 */
export function buttonClasses(
  variant: ButtonVariant = 'gold',
  size: ButtonSize = 'md',
  block?: boolean,
  className?: string,
) {
  return cx(base, variants[variant], sizes[size], block && 'w-full', 'shine shine-hover', className);
}

const classesFor = buttonClasses;

function Inner({ icon, children, trailing }: Pick<BaseProps, 'icon' | 'children' | 'trailing'>) {
  return (
    <>
      {icon ? (
        <span
          aria-hidden="true"
          className="text-[1.1em] transition-transform duration-300 ease-[var(--ease-spring)] group-hover/btn:scale-115"
        >
          {icon}
        </span>
      ) : null}
      <span className="relative z-1">{children}</span>
      {trailing ? (
        <span
          aria-hidden="true"
          className="transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover/btn:translate-x-1"
        >
          {trailing}
        </span>
      ) : null}
    </>
  );
}

export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'gold', size = 'md', block, icon, trailing, className, children } = props;
  const cls = classesFor(variant, size, block, className);

  if ('to' in props && props.to) {
    const { to, external } = props as LinkProps;
    if (external) {
      return (
        <a className={cls} href={to} target="_blank" rel="noreferrer noopener">
          <Inner icon={icon} trailing={trailing}>
            {children}
          </Inner>
        </a>
      );
    }
    return (
      <Link className={cls} to={to}>
        <Inner icon={icon} trailing={trailing}>
          {children}
        </Inner>
      </Link>
    );
  }

  const { variant: _v, size: _s, block: _b, icon: _i, trailing: _t, className: _c, children: _ch, ...rest } =
    props as ButtonProps;
  return (
    <button className={cls} type={rest.type ?? 'button'} {...rest}>
      <Inner icon={icon} trailing={trailing}>
        {children}
      </Inner>
    </button>
  );
}
