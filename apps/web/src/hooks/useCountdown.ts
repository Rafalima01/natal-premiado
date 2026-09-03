import { useEffect, useState } from 'react';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const toParts = (total: number): CountdownParts => ({
  days: Math.floor(total / 86400),
  hours: Math.floor((total % 86400) / 3600),
  minutes: Math.floor((total % 3600) / 60),
  seconds: total % 60,
});

/**
 * Contagem regressiva puramente visual: parte de um valor fixo em segundos e
 * decrementa no cliente (1 timer, 1 setState por segundo). Não consulta nem
 * persiste nada — quando a Etapa 2 chegar, basta trocar a fonte do valor.
 */
export function useCountdown(initialSeconds: number): CountdownParts {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    setRemaining(initialSeconds);
    const id = window.setInterval(() => {
      setRemaining((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [initialSeconds]);

  return toParts(remaining);
}
