import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogOutcome from './LogOutcome';

vi.mock('../services/api', () => ({
  logOutcome: vi.fn(),
}));

import { logOutcome } from '../services/api';

describe('LogOutcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all five outcome states with plain-language labels', () => {
    render(<LogOutcome promiseId="promise_1" />);

    expect(screen.getByLabelText('I did it')).toBeInTheDocument();
    expect(screen.getByLabelText('I did part of it')).toBeInTheDocument();
    expect(
      screen.getByLabelText("I missed it but I'm logging it honestly")
    ).toBeInTheDocument();
    expect(screen.getByLabelText('I forgot')).toBeInTheDocument();
    expect(
      screen.getByLabelText('I changed the commitment')
    ).toBeInTheDocument();
  });

  test('failed_but_noticed gets the same neutral treatment as every other option', () => {
    render(<LogOutcome promiseId="promise_1" />);

    const failedOption = screen
      .getByLabelText("I missed it but I'm logging it honestly")
      .closest('label');
    const keptOption = screen.getByLabelText('I did it').closest('label');

    // Same class, same element shape - no separate error/danger variant.
    expect(failedOption.className).toBe(keptOption.className);
    expect(failedOption).not.toHaveAttribute('role', 'alert');
  });

  test.each([
    ['I did it', 'kept'],
    ['I did part of it', 'partially_kept'],
    ["I missed it but I'm logging it honestly", 'failed_but_noticed'],
    ['I forgot', 'forgotten'],
    ['I changed the commitment', 'renegotiated'],
  ])('selecting "%s" submits outcome "%s"', async (label, value) => {
    const user = userEvent.setup();
    logOutcome.mockResolvedValue({ id: 'out_1' });
    render(<LogOutcome promiseId="promise_1" userId="user_1" />);

    await user.click(screen.getByLabelText(label));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(logOutcome).toHaveBeenCalledWith({
        promiseId: 'promise_1',
        outcome: value,
        userId: 'user_1',
      });
    });
  });

  test('blocks submission and shows an error when no outcome is selected', async () => {
    const user = userEvent.setup();
    render(<LogOutcome promiseId="promise_1" />);

    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    expect(
      screen.getByText('Choose what happened before logging it.')
    ).toBeInTheDocument();
    expect(logOutcome).not.toHaveBeenCalled();
  });

  test('submits note and attachment when provided', async () => {
    const user = userEvent.setup();
    logOutcome.mockResolvedValue({ id: 'out_2' });
    render(<LogOutcome promiseId="promise_1" userId="user_1" />);

    await user.click(screen.getByLabelText('I did it'));
    await user.type(screen.getByLabelText('Note (optional)'), 'Went well');
    await user.type(
      screen.getByLabelText('Attachment (optional)'),
      'proof.jpg'
    );
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(logOutcome).toHaveBeenCalledWith({
        promiseId: 'promise_1',
        outcome: 'kept',
        userId: 'user_1',
        note: 'Went well',
        attachmentRef: 'proof.jpg',
      });
    });
  });

  test('omits note and attachment cleanly when left blank', async () => {
    const user = userEvent.setup();
    logOutcome.mockResolvedValue({ id: 'out_3' });
    render(<LogOutcome promiseId="promise_1" userId="user_1" />);

    await user.click(screen.getByLabelText('I forgot'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(logOutcome).toHaveBeenCalled();
    });

    const call = logOutcome.mock.calls[0][0];
    expect(call).toEqual({
      promiseId: 'promise_1',
      outcome: 'forgotten',
      userId: 'user_1',
    });
    expect(call).not.toHaveProperty('note');
    expect(call).not.toHaveProperty('attachmentRef');
  });

  test('shows success message and resets the form after a successful submit', async () => {
    const user = userEvent.setup();
    logOutcome.mockResolvedValue({ id: 'out_4' });
    render(<LogOutcome promiseId="promise_1" userId="user_1" />);

    await user.click(screen.getByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(screen.getByText('Check-in logged.')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('I did it')).not.toBeChecked();
  });

  test('shows an error message when the API call fails', async () => {
    const user = userEvent.setup();
    logOutcome.mockRejectedValue(new Error('network error'));
    render(<LogOutcome promiseId="promise_1" userId="user_1" />);

    await user.click(screen.getByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to log this check-in. Please try again.')
      ).toBeInTheDocument();
    });
  });

  test('calls onLogged with the created outcome record', async () => {
    const user = userEvent.setup();
    const record = { id: 'out_5', outcome: 'kept' };
    logOutcome.mockResolvedValue(record);
    const onLogged = vi.fn();
    render(
      <LogOutcome promiseId="promise_1" userId="user_1" onLogged={onLogged} />
    );

    await user.click(screen.getByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(onLogged).toHaveBeenCalledWith(record);
    });
  });
});
