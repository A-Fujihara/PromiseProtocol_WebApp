import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PromiseDetail from './PromiseDetail';

vi.mock('../services/api', () => ({
  getPromises: vi.fn(),
  getAssessments: vi.fn(),
}));

import { getPromises, getAssessments } from '../services/api';

const mockPendingPromise = {
  id: 'prm_001',
  promiserId: 'dev_user_001',
  promiseeScope: 'individual',
  domain: 'Web Dev',
  objective: 'Build the dashboard screen',
  timeline: 30,
  successCriteria: 'Dashboard renders with real data',
  stake: { type: 'reputational', amount: null, status: 'held' },
  status: 'pending',
  createdAt: '2026-04-01T12:00:00.000Z',
};

const mockKeptPromise = {
  ...mockPendingPromise,
  id: 'prm_002',
  status: 'KEPT',
};

const mockAssessment = {
  id: 'asm_001',
  promiseId: 'prm_001',
  assessorId: 'dev_user_001',
  judgment: 'KEPT',
  evidenceCid: 'QmXyz...',
  createdAt: '2026-04-05T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PromiseDetail', () => {
  test('renders all promise fields correctly with mocked data', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    render(<PromiseDetail promiseId="prm_001" />);

    await waitFor(() => {
      expect(
        screen.getByText('Build the dashboard screen')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Web Dev')).toBeInTheDocument();
    expect(screen.getByText('individual')).toBeInTheDocument();
    expect(screen.getByText('Reputation')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('Submit Assessment CTA is visible when status is pending', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    render(<PromiseDetail promiseId="prm_001" />);

    await waitFor(() => {
      expect(screen.getByText('Submit Assessment')).toBeInTheDocument();
    });
  });

  test('Submit Assessment CTA is hidden when status is KEPT', async () => {
    getPromises.mockResolvedValue([mockKeptPromise]);
    getAssessments.mockResolvedValue([]);

    render(<PromiseDetail promiseId="prm_002" />);

    await waitFor(() => {
      expect(
        screen.getByText('Build the dashboard screen')
      ).toBeInTheDocument();
    });

    expect(screen.queryByText('Submit Assessment')).not.toBeInTheDocument();
  });

  test('renders empty assessment state when no assessments exist', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    render(<PromiseDetail promiseId="prm_001" />);

    await waitFor(() => {
      expect(
        screen.getByText('No assessments yet. This promise is still active.')
      ).toBeInTheDocument();
    });
  });

  test('lists assessments associated with the promise', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([mockAssessment]);

    render(<PromiseDetail promiseId="prm_001" />);

    await waitFor(() => {
      expect(screen.getByText('dev_user_001')).toBeInTheDocument();
    });

    expect(screen.getByText('Apr 5, 2026')).toBeInTheDocument();
  });

  test('renders not found state when promiseId does not match any promise', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    render(<PromiseDetail promiseId="prm_999" />);

    await waitFor(() => {
      expect(screen.getByText('Promise not found.')).toBeInTheDocument();
    });
  });

  test('renders error state when API call fails', async () => {
    getPromises.mockRejectedValue(new Error('Network error'));
    getAssessments.mockRejectedValue(new Error('Network error'));

    render(<PromiseDetail promiseId="prm_001" />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load promise details. Please try again.')
      ).toBeInTheDocument();
    });
  });

  test('back navigation button is present', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    render(<PromiseDetail promiseId="prm_001" />);

    await waitFor(() => {
      expect(screen.getByText('← Back to Promises')).toBeInTheDocument();
    });
  });
});
