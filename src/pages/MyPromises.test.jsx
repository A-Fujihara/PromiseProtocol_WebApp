import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyPromises from './MyPromises';

vi.mock('../services/api', () => ({
  getPromises: vi.fn(),
}));

import { getPromises } from '../services/api';

const mockPromises = [
  {
    id: 'prm_001',
    promiserId: 'dev_user_001',
    promiseeScope: 'individual',
    domain: 'Web Dev',
    objective: 'Pay rent',
    timeline: 30,
    successCriteria: 'Submit receipts',
    stake: { type: 'reputational', amount: null, status: 'held' },
    status: 'pending',
    createdAt: '2026-04-01',
  },
  {
    id: 'prm_002',
    promiserId: 'dev_user_001',
    promiseeScope: 'organization',
    domain: 'Engineering',
    objective: 'Ship feature',
    timeline: 14,
    successCriteria: 'Release on time',
    stake: { type: 'financial', amount: 150, currency: 'USD', status: 'held' },
    status: 'KEPT',
    createdAt: '2026-04-02',
  },
  {
    id: 'prm_003',
    promiserId: 'dev_user_001',
    promiseeScope: 'team',
    domain: 'Quality',
    objective: 'Fix bug',
    timeline: 7,
    successCriteria: 'All tests pass',
    stake: { type: 'financial', amount: 50, currency: 'USD', status: 'held' },
    status: 'BROKEN',
    createdAt: '2026-04-03',
  },
];

describe('MyPromises', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all promises correctly with mocked API data', async () => {
    getPromises.mockResolvedValue(mockPromises);

    render(<MyPromises />);

    await waitFor(() => {
      expect(screen.getByText('Pay rent')).toBeInTheDocument();
    });

    expect(screen.getByText('Ship feature')).toBeInTheDocument();
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
    expect(screen.getByText('3 Total Commitments')).toBeInTheDocument();
  });

  test('each filter tab shows only the correct subset of promises', async () => {
    const user = userEvent.setup();
    getPromises.mockResolvedValue(mockPromises);

    render(<MyPromises />);

    await waitFor(() => {
      expect(screen.getByText('Pay rent')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getByText('Pay rent')).toBeInTheDocument();
    expect(screen.queryByText('Ship feature')).not.toBeInTheDocument();
    expect(screen.queryByText('Fix bug')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Kept' }));
    expect(screen.getByText('Ship feature')).toBeInTheDocument();
    expect(screen.queryByText('Pay rent')).not.toBeInTheDocument();
    expect(screen.queryByText('Fix bug')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Broken' }));
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
    expect(screen.queryByText('Pay rent')).not.toBeInTheDocument();
    expect(screen.queryByText('Ship feature')).not.toBeInTheDocument();
  });

  test('renders empty filter state when no promises match the active filter', async () => {
    const user = userEvent.setup();
    const noKeptPromises = mockPromises.filter(
      (promise) => promise.status !== 'KEPT'
    );
    getPromises.mockResolvedValue(noKeptPromises);

    render(<MyPromises />);

    await waitFor(() => {
      expect(screen.getByText('Pay rent')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Kept' }));

    expect(
      screen.getByText(
        'No commitments match the selected filter. Try another status.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Pay rent')).not.toBeInTheDocument();
    expect(screen.queryByText('Fix bug')).not.toBeInTheDocument();
  });

  test('clicking a promise card triggers detail navigation behavior', async () => {
    const user = userEvent.setup();
    getPromises.mockResolvedValue(mockPromises);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<MyPromises />);

    await waitFor(() => {
      expect(screen.getByText('Pay rent')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Pay rent'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Navigate to Promise Detail — wired in Epic 3'
    );

    consoleSpy.mockRestore();
  });
});
