import { cx } from '@/lib/format';

interface LogoProps {
  /** só a marca, sem o texto (usado em espaços apertados) */
  markOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const markSizes = { sm: 'size-9', md: 'size-11', lg: 'size-14' } as const;
const textSizes = { sm: 'text-[0.95rem]', md: 'text-[1.15rem]', lg: 'text-[1.5rem]' } as const;

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Natal Premiado">
      <defs>
        <linearGradient id="lg-red" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ff5468" />
          <stop offset="45%" stopColor="#e01b33" />
          <stop offset="100%" stopColor="#79091c" />
        </linearGradient>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fff0bd" />
          <stop offset="35%" stopColor="#ffd45e" />
          <stop offset="70%" stopColor="#ffc531" />
          <stop offset="100%" stopColor="#a86c04" />
        </linearGradient>
        <linearGradient id="lg-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dfe9f5" />
        </linearGradient>
      </defs>

      {/* caixa de presente */}
      <rect x="5" y="7" width="54" height="52" rx="15" fill="url(#lg-red)" />
      <rect
        x="5"
        y="7"
        width="54"
        height="52"
        rx="15"
        fill="none"
        stroke="url(#lg-gold)"
        strokeWidth="2.4"
      />
      {/* brilho superior */}
      <path d="M9 22c3-9 11-13 23-13s20 4 23 13c-9-5-14-6-23-6s-14 1-23 6z" fill="#fff" opacity="0.16" />

      {/* fitas douradas */}
      <rect x="28.4" y="7" width="7.2" height="52" fill="url(#lg-gold)" />
      <rect x="5" y="29" width="54" height="7" fill="url(#lg-gold)" />

      {/* laço */}
      <path
        d="M32 29c-6-1-11-4-11-8s6-5 8-1 3 6 3 9zM32 29c6-1 11-4 11-8s-6-5-8-1-3 6-3 9z"
        fill="url(#lg-gold)"
        stroke="#8a5a02"
        strokeWidth="0.8"
      />
      <circle cx="32" cy="30.5" r="4" fill="url(#lg-gold)" stroke="#8a5a02" strokeWidth="0.8" />

      {/* neve acumulada no topo */}
      <path
        d="M12 12.5c3.5-3 8-4.4 12.5-2.6 3.4-2.6 8-2.4 11 .4 3.6-1.6 7.8-.7 10.3 2.2-4-3.6-9-5.5-16.8-5.5s-13 2-17 5.5z"
        fill="url(#lg-snow)"
        opacity="0.9"
      />

      {/* estrela */}
      <path
        d="M50 4.5l1.7 3.6 3.9.5-2.9 2.7.8 3.9-3.5-1.9-3.5 1.9.8-3.9-2.9-2.7 3.9-.5z"
        fill="url(#lg-gold)"
      />
    </svg>
  );
}

export function Logo({ markOnly = false, size = 'md', className }: LogoProps) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span className={cx('relative shrink-0 drop-shadow-[0_4px_14px_rgba(224,27,51,.55)]', markSizes[size])}>
        <LogoMark className="size-full" />
      </span>
      {markOnly ? null : (
        <span className={cx('flex flex-col leading-none', textSizes[size])}>
          <span className="font-display text-[1em] font-semibold tracking-[-0.02em] text-snow-grad">
            Natal
          </span>
          <span className="font-display text-[0.62em] font-semibold uppercase tracking-[0.24em] text-gold-grad">
            Premiado
          </span>
        </span>
      )}
    </span>
  );
}
