import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';

vi.mock('../services/api', () => ({
  getPromises: vi.fn(),
  getAssessments: vi.fn(),
}));

import { getPromises, getAssessments } from '../services/api';

const mockPromises = [
  {
    id: 'prm_001',
    promiserId: 'dev_user_001',
    promiseeScope: 'individual',
    domain: 'Web Dev',
    objective: 'Build the dashboard screen',
    timeline: 30,
    successCriteria: 'Dashboard renders with real data',
    stake: { type: 'reputational', amount: null, status: 'held' },
    status: 'pending',
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'prm_002',
    promiserId: 'dev_user_001',
    promiseeScope: 'individual',
    domain: 'Design',
    objective: 'Create logo',
    timeline: 14,
    successCriteria: 'Logo delivered',
    stake: { type: 'financial', amount: 100, currency: 'USD', status: 'held' },
    status: 'pending',
    createdAt: '2026-04-02T00:00:00.000Z',
  },
];

const mockAssessments = [
  {
    id: 'asm_001',
    promiseId: 'prm_001',
    assessorId: 'dev_user_001',
    judgment: 'KEPT',
    evidenceCid: 'QmXyz...',
    createdAt: '2026-04-03T00:00:00.000Z',
  },
  {
    id: 'asm_002',
    promiseId: 'prm_002',
    assessorId: 'dev_user_001',
    judgment: 'BROKEN',
    evidenceCid: 'QmAbc...',
    createdAt: '2026-04-04T00:00:00.000Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Dashboard', () => {
  test('renders correctly with mocked API data', async () => {
    getPromises.mockResolvedValue(mockPromises);
    getAssessments.mockResolvedValue(mockAssessments);

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('Build the dashboard screen')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Good morning, Jordan.')).toBeInTheDocument();
    expect(
      screen.getByText("Here's your commitment activity.")
    ).toBeInTheDocument();
  });

  test('displays correct counts for total, kept, and broken', async () => {
    getPromises.mockResolvedValue(mockPromises);
    getAssessments.mockResolvedValue(mockAssessments);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    const allOnes = screen.getAllByText('1');
    expect(allOnes).toHaveLength(2);
  });

  test('renders empty state when no promises exist', async () => {
    getPromises.mockResolvedValue([]);
    getAssessments.mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('No commitments yet. Create your first one!')
      ).toBeInTheDocument();
    });
  });

  test('renders error state when API call fails', async () => {
    getPromises.mockRejectedValue(new Error('Network error'));
    getAssessments.mockRejectedValue(new Error('Network error'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load dashboard data. Please try again.')
      ).toBeInTheDocument();
    });
  });

  test('New Commitment button is present', async () => {
    getPromises.mockResolvedValue(mockPromises);
    getAssessments.mockResolvedValue(mockAssessments);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('+ New Commitment')).toBeInTheDocument();
    });
  });

  test('View all button is present', async () => {
    getPromises.mockResolvedValue(mockPromises);
    getAssessments.mockResolvedValue(mockAssessments);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('View all →')).toBeInTheDocument();
    });
  });
});
