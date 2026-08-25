import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { cx } from '@/lib/format';

interface ScratchCanvasProps {
  children: ReactNode;
  /** % raspada a partir da qual a camada some sozinha */
  threshold?: number;
  onReveal?: () => void;
  className?: string;
}

/**
 * Camada raspável — puro efeito de interface.
 * O que está embaixo é conteúdo React fixo: não há sorteio, resultado ou
 * chamada de rede. Serve para demonstrar a sensação da raspadinha.
 */
export function ScratchCanvas({ children, threshold = 52, onReveal, className }: ScratchCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const sampleTick = useRef(0);

  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);

  /** Pinta a folha metálica por cima. */
  const paintFoil = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const { width, height } = canvas;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    const foil = ctx.createLinearGradient(0, 0, width, height);
    foil.addColorStop(0, '#d8dfea');
    foil.addColorStop(0.25, '#f2f6fb');
    foil.addColorStop(0.45, '#9daabf');
    foil.addColorStop(0.62, '#e6ecf5');
    foil.addColorStop(0.82, '#8e9cb4');
    foil.addColorStop(1, '#c6d0e0');
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, width, height);

    // faixa vermelha diagonal, para não parecer prata chapada
    const stripe = ctx.createLinearGradient(0, height, width, 0);
    stripe.addColorStop(0, 'rgba(224,27,51,0)');
    stripe.addColorStop(0.45, 'rgba(224,27,51,.28)');
    stripe.addColorStop(0.55, 'rgba(255,197,49,.3)');
    stripe.addColorStop(1, 'rgba(47,212,131,0)');
    ctx.fillStyle = stripe;
    ctx.fillRect(0, 0, width, height);

    // granulado
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let index = 0; index < 260; index += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillRect(x, y, 1.4, 1.4);
    }

    // flocos de neve estampados
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.font = `${Math.round(height * 0.09)}px serif`;
    ctx.textAlign = 'center';
    for (let index = 0; index < 10; index += 1) {
      ctx.fillText('❄', (index * width) / 9, ((index % 3) + 1) * (height / 4));
    }

    // instrução
    ctx.fillStyle = 'rgba(28,10,18,.55)';
    ctx.font = `600 ${Math.round(height * 0.11)}px Fredoka, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RASPE AQUI', width / 2, height / 2);
    ctx.font = `500 ${Math.round(height * 0.055)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText('use o dedo ou o mouse', width / 2, height / 2 + height * 0.11);
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    paintFoil(canvas);
    setProgress(0);
    setStarted(false);
  }, [paintFoil]);

  useEffect(() => {
    resize();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (!revealed) resize();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [resize, revealed]);

  /** Mede a área já removida em uma amostra reduzida (barato). */
  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return 0;

    const step = 12;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    let total = 0;
    for (let index = 3; index < data.length; index += 4 * step) {
      total += 1;
      if (data[index] < 24) clear += 1;
    }
    return total ? (clear / total) * 100 : 0;
  }, []);

  const scratchAt = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const dpr = canvas.width / canvas.getBoundingClientRect().width;
    const px = x * dpr;
    const py = y * dpr;
    const radius = Math.max(18, canvas.width * 0.045);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = radius * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const previous = lastPoint.current;
    if (previous) {
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    lastPoint.current = { x: px, y: py };
  }, []);

  const pointerPosition = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handleDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    drawing.current = true;
    setStarted(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = pointerPosition(event);
    lastPoint.current = null;
    scratchAt(x, y);
  };

  const handleMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || revealed) return;
    const { x, y } = pointerPosition(event);
    scratchAt(x, y);

    sampleTick.current += 1;
    if (sampleTick.current % 14 === 0) {
      const pct = measure();
      setProgress(pct);
      if (pct >= threshold) {
        setRevealed(true);
        onReveal?.();
      }
    }
  };

  const handleUp = () => {
    drawing.current = false;
    lastPoint.current = null;
    const pct = measure();
    setProgress(pct);
    if (pct >= threshold) {
      setRevealed(true);
      onReveal?.();
    }
  };

  const revealAll = () => {
    setRevealed(true);
    setProgress(100);
    onReveal?.();
  };

  const reset = () => {
    setRevealed(false);
    lastPoint.current = null;
    resize();
  };

  return (
    <div className={cx('relative', className)}>
      <div ref={wrapRef} className="relative overflow-hidden rounded-xl">
        {/* conteúdo revelado */}
        <div className={cx('transition-transform duration-500 ease-[var(--ease-spring)]', revealed && 'scale-100')}>
          {children}
        </div>

        {/* camada raspável */}
        <canvas
          ref={canvasRef}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          onPointerCancel={handleUp}
          className={cx(
            'absolute inset-0 size-full touch-none select-none transition-opacity duration-500 ease-[var(--ease-out-quint)]',
            revealed ? 'pointer-events-none opacity-0' : 'cursor-grab opacity-100 active:cursor-grabbing',
          )}
        />

        {/* dica de raspagem — some assim que a pessoa começa */}
        {!started && !revealed ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
          >
            <span className="animate-bob rounded-full bg-bordo-deep/85 px-3 py-1.5 text-[0.75rem] font-semibold text-gold-hi shadow-e2">
              👆 arraste para raspar
            </span>
          </span>
        ) : null}
      </div>

      {/* ---------- controles e progresso ---------- */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[10rem] flex-1 items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/45 ring-1 ring-white/8 ring-inset">
            <div
              className="h-full rounded-full bg-linear-to-r from-gold-deep via-gold to-gold-hi transition-[width] duration-200"
              style={{ width: `${Math.min(100, Math.round(revealed ? 100 : progress))}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-[0.78rem] font-semibold text-muted tnum">
            {Math.min(100, Math.round(revealed ? 100 : progress))}%
          </span>
        </div>

        <div className="flex gap-2">
          {revealed ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-border bg-white/5 px-4 py-2 text-[0.82rem] font-semibold text-text-soft transition-colors duration-250 hover:border-gold/45 hover:bg-gold/12 hover:text-gold-hi"
            >
              Raspar de novo
            </button>
          ) : (
            <button
              type="button"
              onClick={revealAll}
              className="rounded-full border border-border bg-white/5 px-4 py-2 text-[0.82rem] font-semibold text-text-soft transition-colors duration-250 hover:border-gold/45 hover:bg-gold/12 hover:text-gold-hi"
            >
              Revelar tudo
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-[0.74rem] text-dim" aria-live="polite">
        {revealed
          ? 'Demonstração revelada. Nada foi sorteado — os símbolos são fixos nesta maquete.'
          : 'Demonstração visual: os símbolos abaixo são fixos e nenhum resultado é gerado.'}
      </p>
    </div>
  );
}
