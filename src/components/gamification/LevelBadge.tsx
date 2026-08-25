import { cx } from '@/lib/format';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'size-10 text-[0.95rem]', md: 'size-14 text-[1.3rem]', lg: 'size-20 text-[1.9rem]' } as const;

/** Escudo de nível — o "avatar" da gamificação. */
export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  return (
    // sem `relative` na base: as camadas se empilham na mesma célula do grid,
    // então quem usa o componente pode posicioná-lo como quiser.
    <span className={cx('inline-grid shrink-0 place-items-center', sizes[size], className)}>
      <svg
        viewBox="0 0 100 100"
        className="col-start-1 row-start-1 size-full drop-shadow-[0_6px_14px_rgba(255,197,49,.45)]"
      >
        <defs>
          <linearGradient id="lvl-gold" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fff3c4" />
            <stop offset="30%" stopColor="#ffd45e" />
            <stop offset="66%" stopColor="#ffc531" />
            <stop offset="100%" stopColor="#a86c04" />
          </linearGradient>
          <linearGradient id="lvl-inner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a0d1d" />
            <stop offset="100%" stopColor="#22060e" />
          </linearGradient>
        </defs>
        {/* escudo */}
        <path
          d="M50 3l38 14v33c0 26-16 39-38 47C28 89 12 76 12 50V17z"
          fill="url(#lvl-gold)"
        />
        <path
          d="M50 12l30 11v27c0 21-13 32-30 38-17-6-30-17-30-38V23z"
          fill="url(#lvl-inner)"
        />
        {/* brilho */}
        <path d="M50 12l30 11v6c-9-6-19-9-30-9s-21 3-30 9v-6z" fill="#fff" opacity="0.14" />
      </svg>
      <span className="col-start-1 row-start-1 font-display font-semibold leading-none text-gold-hi">
        {level}
      </span>
      <span className="col-start-1 row-start-1 sr-only">Nível {level}</span>
    </span>
  );
}
