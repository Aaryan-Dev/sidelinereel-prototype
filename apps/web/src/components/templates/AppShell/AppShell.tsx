import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useReset, useSessionState } from '../../../api/hooks';
import { useDemoSession } from '../../../features/session/SessionProvider';
import { Button, Spinner } from '../../atoms';
import { TabNav, TopBar } from '../../organisms';
import styles from './AppShell.module.css';

/**
 * Page frame: header, tabs, footer. It waits for a demo session before mounting anything
 * that needs one, then loads the session state once and hands it to the pages.
 */
export function AppShell() {
  const { sessionId, error, startNew } = useDemoSession();

  if (sessionId) return <LoadedShell />;

  return (
    <Frame header={<TopBar onReset={() => undefined} resetting />}>
      {error ? (
        <Problem message={error} onRetry={() => void startNew()} />
      ) : (
        <Spinner label="Starting your demo" />
      )}
    </Frame>
  );
}

/** Only rendered once a session exists, so the session hooks below are always safe to call. */
function LoadedShell() {
  const { data: state, error, isPending, refetch } = useSessionState();
  const reset = useReset();

  const header = (
    <>
      <TopBar onReset={() => reset.mutate()} resetting={reset.isPending || !state} />
      {state && <TabNav queueSize={state.health.queueSize} />}
    </>
  );

  let content: ReactNode = null;
  if (state) content = <Outlet context={state} />;
  else if (error) content = <Problem message={error.message} onRetry={() => void refetch()} />;
  else if (isPending) content = <Spinner label="Loading the game" />;

  return <Frame header={header}>{content}</Frame>;
}

function Frame({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.header}>{header}</div>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        A product by{' '}
        <a href="https://ajaia.ai" target="_blank" rel="noopener noreferrer">
          Ajaia
        </a>
      </footer>
    </div>
  );
}

function Problem({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.problem} role="alert">
      <p>{message}</p>
      <Button variant="primary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
