import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePromise from './CreatePromise';

vi.mock('../services/api', () => ({
  createPromise: vi.fn(),
}));

import { createPromise } from '../services/api';

describe('CreatePromise', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<CreatePromise />);

    await user.click(screen.getByRole('button', { name: 'Submit Commitment' }));

    expect(screen.getByText('Commitment objective is required.')).toBeInTheDocument();
    expect(screen.getByText('Commitment recipient is required.')).toBeInTheDocument();
    expect(screen.getByText('Commitment scope is required.')).toBeInTheDocument();
    expect(screen.getByText('Domain is required.')).toBeInTheDocument();
    expect(
      screen.getByText('Timeline must be a positive whole number of days.')
    ).toBeInTheDocument();
    expect(screen.getByText('Success criteria is required.')).toBeInTheDocument();
    expect(createPromise).not.toHaveBeenCalled();
  });

  test('shows amount input only for Financial deposit type', async () => {
    const user = userEvent.setup();
    render(<CreatePromise />);

    expect(screen.queryByLabelText('Deposit amount')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Financial'));
    expect(screen.getByLabelText('Deposit amount')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Reputational'));
    expect(screen.queryByLabelText('Deposit amount')).not.toBeInTheDocument();
  });

  test('submits correct payload for financial deposit', async () => {
    const user = userEvent.setup();
    createPromise.mockResolvedValue({ id: 'prm_999' });
    render(<CreatePromise />);

    await user.type(screen.getByLabelText('Commitment objective'), 'Ship PP-008');
    await user.type(screen.getByLabelText('Commitment recipient name'), 'Jordan');
    await user.selectOptions(screen.getByLabelText('Commitment scope'), 'organization');
    await user.type(screen.getByLabelText('Domain'), 'Engineering');
    await user.type(screen.getByLabelText('Timeline (days)'), '30');
    await user.type(screen.getByLabelText('Success criteria'), 'Form is accepted by backend');
    await user.click(screen.getByLabelText('Financial'));
    await user.type(screen.getByLabelText('Deposit amount'), '250');

    await user.click(screen.getByRole('button', { name: 'Submit Commitment' }));

    await waitFor(() => {
      expect(createPromise).toHaveBeenCalledTimes(1);
    });

    expect(createPromise).toHaveBeenCalledWith({
      promiserId: 'dev_user_001',
      promiseeScope: 'organization',
      domain: 'Engineering',
      objective: 'Ship PP-008',
      days: 30,
      successCriteria: 'Form is accepted by backend',
      stake: {
        type: 'financial',
        amount: 250,
      },
    });
  });

  test('submits correct payload for reputational deposit without amount', async () => {
    const user = userEvent.setup();
    createPromise.mockResolvedValue({ id: 'prm_1001' });
    render(<CreatePromise />);

    await user.type(screen.getByLabelText('Commitment objective'), 'Ship PP-008');
    await user.type(screen.getByLabelText('Commitment recipient name'), 'Jordan');
    await user.selectOptions(screen.getByLabelText('Commitment scope'), 'self');
    await user.type(screen.getByLabelText('Domain'), 'Engineering');
    await user.type(screen.getByLabelText('Timeline (days)'), '21');
    await user.type(screen.getByLabelText('Success criteria'), 'All validations pass');

    await user.click(screen.getByRole('button', { name: 'Submit Commitment' }));

    await waitFor(() => {
      expect(createPromise).toHaveBeenCalledTimes(1);
    });

    expect(createPromise).toHaveBeenCalledWith({
      promiserId: 'dev_user_001',
      promiseeScope: 'self',
      domain: 'Engineering',
      objective: 'Ship PP-008',
      days: 21,
      successCriteria: 'All validations pass',
      stake: {
        type: 'reputational',
      },
    });
    expect(createPromise.mock.calls[0][0].stake).not.toHaveProperty('amount');
  });

  test('renders success state after successful submission', async () => {
    const user = userEvent.setup();
    createPromise.mockResolvedValue({ id: 'prm_1000' });
    render(<CreatePromise />);

    await user.type(screen.getByLabelText('Commitment objective'), 'Submit successful form');
    await user.type(screen.getByLabelText('Commitment recipient name'), 'Jordan');
    await user.selectOptions(screen.getByLabelText('Commitment scope'), 'individual');
    await user.type(screen.getByLabelText('Domain'), 'Product');
    await user.type(screen.getByLabelText('Timeline (days)'), '14');
    await user.type(screen.getByLabelText('Success criteria'), 'Backend returns 201');

    await user.click(screen.getByRole('button', { name: 'Submit Commitment' }));

    await waitFor(() => {
      expect(screen.getByText('Commitment created successfully.')).toBeInTheDocument();
    });
  });

  test('renders error state after failed submission', async () => {
    const user = userEvent.setup();
    createPromise.mockRejectedValue(new Error('Network error'));
    render(<CreatePromise />);

    await user.type(screen.getByLabelText('Commitment objective'), 'Submit failing form');
    await user.type(screen.getByLabelText('Commitment recipient name'), 'Jordan');
    await user.selectOptions(screen.getByLabelText('Commitment scope'), 'public');
    await user.type(screen.getByLabelText('Domain'), 'Product');
    await user.type(screen.getByLabelText('Timeline (days)'), '14');
    await user.type(screen.getByLabelText('Success criteria'), 'Backend returns 500');

    await user.click(screen.getByRole('button', { name: 'Submit Commitment' }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to create commitment. Please try again.')
      ).toBeInTheDocument();
    });
  });
});
