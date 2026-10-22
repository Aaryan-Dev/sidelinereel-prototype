import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { sessionsApi } from '../../api/sessions';

const STORAGE_KEY = 'sidelinereel.sessionId';

// Storage can throw (private windows, blocked site data); the app works without it.
const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const write = (id: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
};

interface SessionContextValue {
  sessionId: string | null;
  /** Message if a session could not be created. */
  error: string | null;
  /** Replace the current session with a freshly seeded one. */
  startNew: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Gives every visitor their own demo session, remembered across reloads. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(read);
  const [error, setError] = useState<string | null>(null);
  const creating = useRef(false);

  const startNew = useCallback(async () => {
    if (creating.current) return;
    creating.current = true;
    try {
      const { sessionId: id } = await sessionsApi.create();
      write(id);
      setError(null);
      setSessionId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start a demo session.');
    } finally {
      creating.current = false;
    }
  }, []);

  useEffect(() => {
    if (!sessionId) void startNew();
  }, [sessionId, startNew]);

  const value = useMemo(() => ({ sessionId, error, startNew }), [sessionId, error, startNew]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useDemoSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useDemoSession must be used inside SessionProvider');
  return ctx;
}
