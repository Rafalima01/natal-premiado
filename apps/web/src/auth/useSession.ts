import { useContext } from 'react';
import { SessionContext, type SessionState } from './SessionProvider';

/** Acessa o estado de autenticação. Falha claro fora do provider. */
export function useSession(): SessionState {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession precisa estar dentro de <SessionProvider>');
  }
  return context;
}
