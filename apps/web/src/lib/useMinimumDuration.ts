import { useEffect, useRef, useState } from 'react';

/**
 * True while `active` is true, and for at least `ms` after it turns on. A fast request would
 * otherwise flash a loader for a few milliseconds, which looks like a glitch instead of feedback.
 */
export function useMinimumDuration(active: boolean, ms: number): boolean {
  const [showing, setShowing] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    if (active) {
      startedAt.current = Date.now();
      setShowing(true);
      return;
    }
    if (!showing) return;
    const remaining = Math.max(0, ms - (Date.now() - startedAt.current));
    const timer = setTimeout(() => setShowing(false), remaining);
    return () => clearTimeout(timer);
  }, [active, ms, showing]);

  return active || showing;
}
