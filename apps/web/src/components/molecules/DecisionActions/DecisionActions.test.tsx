import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DecisionActions } from './DecisionActions';

const roster = [
  { number: 4, name: 'Sofia Rivera' },
  { number: 14, name: 'Lucy Grant' },
];

function setup(props: Partial<Parameters<typeof DecisionActions>[0]> = {}) {
  const onDecide = vi.fn();
  render(
    <DecisionActions detected={14} roster={roster} canConfirm onDecide={onDecide} {...props} />,
  );
  return { onDecide, user: userEvent.setup() };
}

describe('DecisionActions', () => {
  it('confirms the detected number', async () => {
    const { onDecide, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Confirm #14' }));
    expect(onDecide).toHaveBeenCalledWith({ action: 'confirm' });
  });

  it('excludes the clip', async () => {
    const { onDecide, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Exclude clip' }));
    expect(onDecide).toHaveBeenCalledWith({ action: 'exclude' });
  });

  it('needs a player chosen before reassigning', async () => {
    const { onDecide, user } = setup();
    const reassign = screen.getByRole('button', { name: 'Reassign' });
    expect(reassign).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Reassign to'), '4');
    expect(reassign).toBeEnabled();
    await user.click(reassign);
    expect(onDecide).toHaveBeenCalledWith({ action: 'reassign', to: 4 });
  });

  it('hides Confirm when the detected number is not on the roster', () => {
    setup({ detected: 32, canConfirm: false });
    expect(screen.queryByRole('button', { name: /Confirm/ })).not.toBeInTheDocument();
  });

  it('disables every action while a request is in flight', () => {
    setup({ disabled: true });
    expect(screen.getByRole('button', { name: 'Confirm #14' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Exclude clip' })).toBeDisabled();
  });
});
