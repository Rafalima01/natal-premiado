import type { CSSProperties } from 'react';
import { cx } from '@/lib/format';
import { Coin } from './Coin';
import { GiftBox } from './GiftBox';

/** Papai Noel estilizado — vetor próprio, sem imagem externa. */
function Santa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 560" className={className} role="img" aria-label="Papai Noel do Natal Premiado">
      <defs>
        <linearGradient id="sc-hat" x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ff6274" />
          <stop offset="38%" stopColor="#e01b33" />
          <stop offset="100%" stopColor="#6d0817" />
        </linearGradient>
        <linearGradient id="sc-coat" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#e8213c" />
          <stop offset="55%" stopColor="#ac1027" />
          <stop offset="100%" stopColor="#5c0613" />
        </linearGradient>
        <linearGradient id="sc-fur" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f3f6fb" />
          <stop offset="100%" stopColor="#c9d4e4" />
        </linearGradient>
        <linearGradient id="sc-beard" x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="52%" stopColor="#eef2f9" />
          <stop offset="100%" stopColor="#bdc9dc" />
        </linearGradient>
        <linearGradient id="sc-skin" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffdcc0" />
          <stop offset="55%" stopColor="#f7bd97" />
          <stop offset="100%" stopColor="#d9926c" />
        </linearGradient>
        <linearGradient id="sc-gold" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#fff0bd" />
          <stop offset="35%" stopColor="#ffd45e" />
          <stop offset="70%" stopColor="#ffc531" />
          <stop offset="100%" stopColor="#a86c04" />
        </linearGradient>
        <linearGradient id="sc-lens" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#3b4260" />
          <stop offset="45%" stopColor="#161a2b" />
          <stop offset="100%" stopColor="#05060d" />
        </linearGradient>
      </defs>

      {/* ------- casaco ------- */}
      <path d="M74 560c8-78 58-118 128-128h116c70 10 120 50 128 128z" fill="url(#sc-coat)" />
      <path d="M330 432c70 10 120 50 128 128h-58c-6-58-34-96-70-128z" fill="#000" opacity="0.18" />
      <rect x="148" y="424" width="224" height="38" rx="19" fill="url(#sc-fur)" />

      {/* ------- corrente de ouro ------- */}
      {[
        [194, 456], [207, 473], [223, 487], [241, 496], [260, 500],
        [279, 496], [297, 487], [313, 473], [326, 456],
      ].map(([cx1, cy1]) => (
        <circle key={`${cx1}-${cy1}`} cx={cx1} cy={cy1} r="6.5" fill="url(#sc-gold)" />
      ))}
      <circle cx="260" cy="524" r="18" fill="url(#sc-gold)" stroke="#8a5a02" strokeWidth="1.5" />
      <text
        x="260"
        y="525"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Fredoka, sans-serif"
        fontSize="16"
        fontWeight="600"
        fill="#7a4d02"
      >
        R$
      </text>

      {/* ------- rosto ------- */}
      <ellipse cx="260" cy="252" rx="106" ry="100" fill="url(#sc-skin)" />
      <ellipse cx="196" cy="296" rx="26" ry="15" fill="#e8624f" opacity="0.3" />
      <ellipse cx="324" cy="296" rx="26" ry="15" fill="#e8624f" opacity="0.3" />

      {/* ------- barba ------- */}
      <path
        d="M150 232c26 68 56 90 110 90s84-22 110-90c10 98-22 192-110 214-88-22-120-116-110-214z"
        fill="url(#sc-beard)"
      />
      <path
        d="M150 232c26 68 56 90 110 90s84-22 110-90c2 20 1 38-2 54-30 40-64 56-108 56s-78-16-108-56c-3-16-4-34-2-54z"
        fill="#9fb0c9"
        opacity="0.25"
      />
      {/* mechas */}
      <path d="M212 372c8 26 20 46 48 58-32-4-48-30-48-58z" fill="#b7c4d8" opacity="0.4" />
      <path d="M308 372c-8 26-20 46-48 58 32-4 48-30 48-58z" fill="#b7c4d8" opacity="0.4" />

      {/* ------- bigode ------- */}
      <ellipse cx="222" cy="318" rx="42" ry="24" transform="rotate(-12 222 318)" fill="url(#sc-beard)" />
      <ellipse cx="298" cy="318" rx="42" ry="24" transform="rotate(12 298 318)" fill="url(#sc-beard)" />

      {/* ------- nariz ------- */}
      <ellipse cx="260" cy="292" rx="24" ry="20" fill="#f0a279" />
      <ellipse cx="253" cy="286" rx="9" ry="6" fill="#fff" opacity="0.45" />

      {/* ------- óculos escuros ------- */}
      <g>
        <rect x="150" y="248" width="18" height="10" rx="5" fill="url(#sc-gold)" />
        <rect x="352" y="248" width="18" height="10" rx="5" fill="url(#sc-gold)" />
        <rect x="246" y="252" width="28" height="9" rx="4.5" fill="url(#sc-gold)" />
        <rect x="164" y="238" width="88" height="50" rx="19" fill="url(#sc-lens)" stroke="url(#sc-gold)" strokeWidth="3.5" />
        <rect x="268" y="238" width="88" height="50" rx="19" fill="url(#sc-lens)" stroke="url(#sc-gold)" strokeWidth="3.5" />
        <path d="M186 284l30-44h16l-30 44z" fill="#fff" opacity="0.28" />
        <path d="M290 284l30-44h16l-30 44z" fill="#fff" opacity="0.28" />
      </g>

      {/* ------- gorro ------- */}
      <path
        d="M148 214c-8-100 64-164 148-164 72 0 124 38 144 86 9 21-4 38-26 34-40-7-74 2-102 17-36 19-100 33-142 28-16-2-22-1-22-1z"
        fill="url(#sc-hat)"
      />
      <path
        d="M296 50c72 0 124 38 144 86 9 21-4 38-26 34-12-2-23-3-34-3 14-26 6-64-24-88-18-15-38-25-60-29z"
        fill="#fff"
        opacity="0.12"
      />
      <rect x="140" y="178" width="242" height="18" rx="9" fill="url(#sc-gold)" />
      <rect x="130" y="188" width="262" height="46" rx="23" fill="url(#sc-fur)" />
      <circle cx="446" cy="152" r="34" fill="url(#sc-fur)" />
      <circle cx="436" cy="142" r="12" fill="#fff" opacity="0.8" />
    </svg>
  );
}

/** Cartela de raspadinha flutuante (elemento decorativo do hero). */
function MiniScratch({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 140 100" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="ms-bg" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#3a1220" />
          <stop offset="100%" stopColor="#1b0810" />
        </linearGradient>
        <linearGradient id="ms-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9edf5" />
          <stop offset="45%" stopColor="#aab6c9" />
          <stop offset="100%" stopColor="#7d8ba3" />
        </linearGradient>
        <linearGradient id="ms-gold" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffe89a" />
          <stop offset="60%" stopColor="#ffc531" />
          <stop offset="100%" stopColor="#a86c04" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="136" height="96" rx="14" fill="url(#ms-bg)" stroke="url(#ms-gold)" strokeWidth="2.5" />
      <rect x="14" y="14" width="112" height="20" rx="7" fill="url(#ms-gold)" opacity="0.85" />
      {[0, 1, 2].map((index) => (
        <g key={index}>
          <rect x={14 + index * 38} y={44} width="34" height="40" rx="8" fill="#120510" stroke="#ffc531" strokeOpacity="0.4" />
          <text
            x={31 + index * 38}
            y={65}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="18"
          >
            {['💰', '🎁', '⭐'][index]}
          </text>
        </g>
      ))}
      {/* camada raspável parcialmente removida */}
      <path d="M74 40h52a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H74c14-18 8-40 0-58z" fill="url(#ms-foil)" opacity="0.92" />
    </svg>
  );
}

export function SantaScene({ className }: { className?: string }) {
  return (
    <div className={cx('relative isolate mx-auto w-full max-w-[34rem]', className)}>
      {/* halos por trás do personagem */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[6%] -z-10 rounded-full opacity-90 blur-2xl"
        style={{
          background:
            'radial-gradient(closest-side, oklch(0.72 0.2 25 / 65%), oklch(0.55 0.2 20 / 25%) 55%, transparent 78%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[16%] -z-10 rounded-full opacity-80 blur-xl"
        style={{
          background: 'radial-gradient(closest-side, oklch(0.9 0.16 88 / 55%), transparent 72%)',
        }}
      />
      {/* anel decorativo girando devagar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[2%] -z-10 animate-spin-slow rounded-full border border-dashed border-gold/25"
      />

      <Santa className="relative z-1 w-full drop-shadow-[0_30px_60px_rgba(0,0,0,.55)]" />

      {/* ------- elementos flutuantes ------- */}
      <GiftBox
        accent="pine"
        className="absolute -bottom-2 -left-2 z-2 w-24 animate-float drop-shadow-[0_16px_28px_rgba(0,0,0,.5)] sm:w-32"
        style={{ animationDelay: '-1.2s' }}
      />
      <GiftBox
        accent="gold"
        className="absolute -right-1 bottom-6 z-2 w-20 animate-float-slow drop-shadow-[0_16px_28px_rgba(0,0,0,.5)] sm:w-24"
        style={{ animationDelay: '-3.4s' }}
      />
      <Coin
        className="absolute top-[4%] left-[12%] z-2 w-12 animate-float drop-shadow-[0_10px_18px_rgba(0,0,0,.45)] sm:w-16"
        style={{ animationDelay: '-0.4s' }}
      />
      <Coin
        label="$"
        className="absolute top-[38%] -right-3 z-2 w-10 animate-float-slow drop-shadow-[0_10px_18px_rgba(0,0,0,.45)] sm:w-14"
        style={{ animationDelay: '-2.6s' }}
      />
      <Coin
        className="absolute top-[2%] right-[18%] z-2 w-8 animate-bob opacity-90 sm:w-10"
        style={{ animationDelay: '-1.8s' }}
      />
      <MiniScratch
        className="absolute top-[34%] -left-4 z-3 w-28 rotate-[-11deg] animate-bob drop-shadow-[0_18px_30px_rgba(0,0,0,.55)] sm:-left-8 sm:w-36"
        style={{ animationDelay: '-2.2s' }}
      />

      {/* faíscas */}
      {[
        { top: '10%', left: '14%', delay: '0s', size: 'text-lg' },
        { top: '30%', left: '92%', delay: '0.7s', size: 'text-sm' },
        { top: '62%', left: '6%', delay: '1.3s', size: 'text-base' },
        { top: '78%', left: '86%', delay: '1.9s', size: 'text-lg' },
      ].map((spark) => (
        <span
          key={spark.delay}
          aria-hidden="true"
          className={cx('pointer-events-none absolute z-3 animate-twinkle text-gold-hi', spark.size)}
          style={{ top: spark.top, left: spark.left, animationDelay: spark.delay }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
