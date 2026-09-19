import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PromiseDetail from './PromiseDetail';

vi.mock('../services/api', () => ({
  getPromises: vi.fn(),
  getAssessments: vi.fn(),
  getSelfTrust: vi.fn(),
  getOutcomes: vi.fn(),
  logOutcome: vi.fn(),
}));

import {
  getPromises,
  getAssessments,
  getSelfTrust,
  getOutcomes,
  logOutcome,
} from '../services/api';

const mockPendingPromise = {
  id: 'prm_001',
  promiserId: 'dev_user_001',
  promiseeScope: 'individual',
  promiseeName: 'Jordan',
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

const mockSelfPromise = {
  id: 'prm_self_001',
  promiserId: 'dev_user_001',
  promiseeScope: 'self',
  kind: 'self',
  visibility: 'private',
  domain: 'Health',
  objective: 'Go to the gym 3 times a week',
  timeline: 30,
  successCriteria: '12 gym sessions in 30 days',
  stake: null,
  status: 'pending',
  createdAt: '2026-04-01T12:00:00.000Z',
};

const mockSelfTrust = { score: 72, count: 3 };

const mockOutcome = {
  id: 'out_001',
  promiseId: 'prm_self_001',
  outcome: 'kept',
  note: 'Went this morning',
  attachmentRef: null,
  createdAt: '2026-04-08T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

function renderWithRouter(id) {
  return render(
    <MemoryRouter initialEntries={[`/promises/${id}`]}>
      <Routes>
        <Route path="/promises/:id" element={<PromiseDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PromiseDetail', () => {
  test('renders all promise fields correctly with mocked data', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    renderWithRouter('prm_001');

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

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(screen.getByText('Submit Assessment')).toBeInTheDocument();
    });
  });

  test('Submit Assessment CTA is hidden when status is KEPT', async () => {
    getPromises.mockResolvedValue([mockKeptPromise]);
    getAssessments.mockResolvedValue([]);

    renderWithRouter('prm_002');

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

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(
        screen.getByText('No assessments yet. This promise is still active.')
      ).toBeInTheDocument();
    });
  });

  test('lists assessments associated with the promise', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([mockAssessment]);

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(screen.getByText('dev_user_001')).toBeInTheDocument();
    });

    expect(screen.getByText('Apr 5, 2026')).toBeInTheDocument();
  });

  test('renders not found state when id does not match any promise', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    renderWithRouter('prm_999');

    await waitFor(() => {
      expect(screen.getByText('Promise not found.')).toBeInTheDocument();
    });
  });

  test('renders error state when API call fails', async () => {
    getPromises.mockRejectedValue(new Error('Network error'));
    getAssessments.mockRejectedValue(new Error('Network error'));

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load promise details. Please try again.')
      ).toBeInTheDocument();
    });
  });

  test('back navigation button is present', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(screen.getByText('← Back to Promises')).toBeInTheDocument();
    });
  });

  test('renders promiseeName when present', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(screen.getByText('Jordan')).toBeInTheDocument();
    });
  });

  test('renders -- fallback when promiseeName is absent', async () => {
    const promiseWithoutName = {
      ...mockPendingPromise,
      promiseeName: undefined,
    };
    getPromises.mockResolvedValue([promiseWithoutName]);
    getAssessments.mockResolvedValue([]);

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(
        screen.getByText('Build the dashboard screen')
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  test('renders "No deposit" instead of crashing when stake is null (self-promise)', async () => {
    const selfPromise = {
      ...mockPendingPromise,
      kind: 'self',
      visibility: 'private',
      stake: null,
    };
    getPromises.mockResolvedValue([selfPromise]);
    getSelfTrust.mockResolvedValue({ score: 50, count: 0 });
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(screen.getByText('No deposit')).toBeInTheDocument();
    });
  });

  test('requests promises scoped to the current user', async () => {
    getPromises.mockResolvedValue([mockPendingPromise]);
    getAssessments.mockResolvedValue([]);

    renderWithRouter('prm_001');

    await waitFor(() => {
      expect(getPromises).toHaveBeenCalledWith('dev_user_001');
    });
  });
});

// PP-B3: self-promise detail view - live score, check-in history, and the
// check-in form, in place of the assessed-promise assessment flow.
describe('PromiseDetail (self-promise)', () => {
  test('renders the live self-trust score for a self-promise', async () => {
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('72')).toBeInTheDocument();
    });
    expect(screen.getByText('3 check-ins')).toBeInTheDocument();
  });

  test('renders check-in history for a self-promise', async () => {
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([mockOutcome]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('Did it')).toBeInTheDocument();
    });
    expect(screen.getByText('Went this morning')).toBeInTheDocument();
  });

  test('renders empty check-in history state when no outcomes exist', async () => {
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(
        screen.getByText("No check-ins yet. Log one below when you're ready.")
      ).toBeInTheDocument();
    });
  });

  test('renders the check-in form for a self-promise', async () => {
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('Log a Check-in')).toBeInTheDocument();
    });
    expect(screen.getByText('Log check-in')).toBeInTheDocument();
  });

  test('does not show Submit Assessment CTA for a self-promise, even while pending', async () => {
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('Log a Check-in')).toBeInTheDocument();
    });
    expect(screen.queryByText('Submit Assessment')).not.toBeInTheDocument();
    expect(screen.queryByText('Ready to assess?')).not.toBeInTheDocument();
  });

  test('does not fetch assessments for a self-promise', async () => {
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('Log a Check-in')).toBeInTheDocument();
    });
    expect(getAssessments).not.toHaveBeenCalled();
  });

  test('requests self-trust and outcomes scoped to the promise and current user', async () => {
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(getSelfTrust).toHaveBeenCalledWith('prm_self_001', 'dev_user_001');
    });
    expect(getOutcomes).toHaveBeenCalledWith('prm_self_001', 'dev_user_001');
  });

  test('re-fetches score and history after a check-in is logged', async () => {
    const user = userEvent.setup();
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('Log a Check-in')).toBeInTheDocument();
    });

    expect(getSelfTrust).toHaveBeenCalledTimes(1);
    expect(getOutcomes).toHaveBeenCalledTimes(1);

    getSelfTrust.mockResolvedValue({ score: 80, count: 4 });
    getOutcomes.mockResolvedValue([mockOutcome]);
    logOutcome.mockResolvedValue(mockOutcome);

    await user.click(screen.getByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(getSelfTrust).toHaveBeenCalledTimes(2);
    });
    expect(getOutcomes).toHaveBeenCalledTimes(2);
  });
});
