import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';

const session = vi.hoisted(() => ({
  value: { sessionId: null as string | null, error: null as string | null, startNew: vi.fn() },
}));

vi.mock('../../../features/session/SessionProvider', () => ({
  useDemoSession: () => session.value,
}));

// Regression: on first load there is no session yet, and mounting anything that needs
// one (like the reset button's hook) used to crash with "No active session".
describe('AppShell before a session exists', () => {
  beforeEach(() => {
    session.value = { sessionId: null, error: null, startNew: vi.fn() };
  });

  it('shows a loading state instead of crashing', () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Starting your demo/)).toBeInTheDocument();
  });

  it('shows the error and a retry when the session cannot be created', () => {
    session.value = { sessionId: null, error: 'Could not reach the server.', startNew: vi.fn() };
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not reach the server.');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('still links to ajaia.ai in the footer', () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Ajaia' })).toHaveAttribute('href', 'https://ajaia.ai');
  });
});
