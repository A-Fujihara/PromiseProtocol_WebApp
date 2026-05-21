import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicProfile from './PublicProfile';

vi.mock('../services/api', () => ({
  getPromises: vi.fn(),
  getAssessments: vi.fn(),
}));

import { getPromises, getAssessments } from '../services/api';

const mockPromise = {
  id: 'prm_001',
  promiserId: 'dev_user_001',
  domain: 'Web Dev',
  objective: 'Build the dashboard screen',
  status: 'pending',
  createdAt: '2026-04-01T12:00:00.000Z',
};

const mockAssessmentKept = {
  id: 'asm_001',
  promiseId: 'prm_001',
  assessorId: 'dev_user_002',
  judgment: 'KEPT',
  createdAt: '2026-04-05T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

function renderComponent() {
  return render(
    <MemoryRouter>
      <PublicProfile />
    </MemoryRouter>
  );
}

describe('PublicProfile', () => {
  test('renders profile name and role', async () => {
    getPromises.mockResolvedValue([mockPromise]);
    getAssessments.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Freelance Developer & Designer')
    ).toBeInTheDocument();
  });

  test('renders placeholder when no assessments exist', async () => {
    getPromises.mockResolvedValue([mockPromise]);
    getAssessments.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No assessments yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Pending algorithm')).toBeInTheDocument();
  });

  test('renders kept rate when assessments exist', async () => {
    getPromises.mockResolvedValue([mockPromise]);
    getAssessments.mockResolvedValue([mockAssessmentKept]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  test('renders promise breakdown with correct counts', async () => {
    getPromises.mockResolvedValue([mockPromise]);
    getAssessments.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    expect(screen.getByText('Kept')).toBeInTheDocument();
    expect(screen.getByText('Broken')).toBeInTheDocument();
  });

  test('renders share card with public profile URL', async () => {
    getPromises.mockResolvedValue([mockPromise]);
    getAssessments.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Your public trust profile')).toBeInTheDocument();
    });

    expect(
      screen.getByText('promiseprotocol.com/profile/dev_user_001')
    ).toBeInTheDocument();
  });

  test('renders error state when API call fails', async () => {
    getPromises.mockRejectedValue(new Error('Network error'));
    getAssessments.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load profile data. Please try again.')
      ).toBeInTheDocument();
    });
  });

  test('renders Share Profile and Copy Link buttons', async () => {
    getPromises.mockResolvedValue([mockPromise]);
    getAssessments.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Share Profile ↗')).toBeInTheDocument();
    });

    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });
});
