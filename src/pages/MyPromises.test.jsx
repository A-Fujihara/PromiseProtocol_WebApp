import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MyPromises from './MyPromises';
import { getPromises } from '../services/api';

vi.mock('../services/api', () => ({
  getPromises: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  const renderWithRouter = () => render(
    <MemoryRouter>
      <MyPromises />
    </MemoryRouter>
  );

  test('renders all promises correctly with mocked API data', async () => {
    getPromises.mockResolvedValue(mockPromises);

    renderWithRouter();

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

    renderWithRouter();

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

  test('renders filter empty state when no promises match the active filter', async () => {
    const user = userEvent.setup();
    const noKeptPromises = mockPromises.filter((p) => p.status !== 'KEPT');
    getPromises.mockResolvedValue(noKeptPromises);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Pay rent')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Kept' }));

    expect(screen.getByText('No commitments match this filter.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create your first commitment' })).not.toBeInTheDocument();
  });

  test('renders true empty state and navigates to /create on click', async () => {
    const user = userEvent.setup();
    getPromises.mockResolvedValue([]);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("You haven't made any commitments yet.")).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: 'Create your first commitment' });
    expect(createBtn).toBeInTheDocument();

    await user.click(createBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/create');
  });

  test('clicking a promise card triggers detail navigation behavior', async () => {
    const user = userEvent.setup();
    getPromises.mockResolvedValue(mockPromises);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Pay rent')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Pay rent'));

    expect(consoleSpy).toHaveBeenCalledWith('Navigate to Promise Detail — wired in Epic 3');

    consoleSpy.mockRestore();
  });
});