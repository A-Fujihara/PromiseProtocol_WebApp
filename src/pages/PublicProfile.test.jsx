import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicProfile from './PublicProfile';

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
    status: 'pending',
    stake: { type: 'reputational', amount: null, status: 'held' },
    createdAt: '2026-04-01T12:00:00.000Z',
  },
  {
    id: 'prm_002',
    promiserId: 'dev_user_001',
    promiseeScope: 'individual',
    domain: 'Design',
    objective: 'Create logo',
    status: 'pending',
    stake: { type: 'financial', amount: 100, status: 'held' },
    createdAt: '2026-04-02T12:00:00.000Z',
  },
  {
    id: 'prm_003',
    promiserId: 'other_user_999',
    promiseeScope: 'individual',
    domain: 'Marketing',
    objective: 'This belongs to another user',
    status: 'pending',
    stake: { type: 'reputational', amount: null, status: 'held' },
    createdAt: '2026-04-03T12:00:00.000Z',
  },
];

const mockAssessments = [
  {
    id: 'asm_001',
    promiseId: 'prm_001',
    assessorId: 'dev_user_001',
    judgment: 'KEPT',
    createdAt: '2026-04-05T12:00:00.000Z',
  },
  {
    id: 'asm_002',
    promiseId: 'prm_002',
    assessorId: 'dev_user_001',
    judgment: 'BROKEN',
    createdAt: '2026-04-06T12:00:00.000Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PublicProfile', () => {
  test('renders reputation score as stub and kept rate correctly', async () => {
    getPromises.mockResolvedValue(mockPromises);
    getAssessments.mockResolvedValue(mockAssessments);

    render(<PublicProfile />);

    await waitFor(() => {
      expect(screen.getByText('Pending algorithm')).toBeInTheDocument();
    });

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('renders promise breakdown counts accurately', async () => {
    getPromises.mockResolvedValue(mockPromises);
    getAssessments.mockResolvedValue(mockAssessments);

    render(<PublicProfile />);

    await waitFor(() => {
      expect(screen.getByText('Promise Breakdown')).toBeInTheDocument();
    });

    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  test('Copy Link button copies the correct URL to clipboard', async () => {
    getPromises.mockResolvedValue(mockPromises);
    getAssessments.mockResolvedValue(mockAssessments);

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    });

    render(<PublicProfile />);

    await waitFor(() => {
      expect(screen.getAllByText('Copy Link')[0]).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByText('Copy Link')[0]);

    expect(writeText).toHaveBeenCalledWith(
      'promiseprotocol.com/profile/dev_user_001'
    );
  });

  test('renders correctly when viewed without being logged in', async () => {
    getPromises.mockResolvedValue([]);
    getAssessments.mockResolvedValue([]);

    render(<PublicProfile />);

    await waitFor(() => {
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
    });

    const dashes = screen.getAllByText('--');
    expect(dashes).toHaveLength(2);
  });

  test('renders error state when API call fails', async () => {
    getPromises.mockRejectedValue(new Error('Network error'));
    getAssessments.mockRejectedValue(new Error('Network error'));

    render(<PublicProfile />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load profile data. Please try again.')
      ).toBeInTheDocument();
    });
  });
});
