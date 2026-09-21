import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
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

// PP-B3-fix: lets a test navigate between two real routes within the same
// MemoryRouter, since MemoryRouter only reads initialEntries once - a
// re-render with different initialEntries does not actually change the
// route.
function NavigateButton({ to }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>{`navigate to ${to}`}</button>;
}

function renderWithNavigableRouter(startId) {
  return render(
    <MemoryRouter initialEntries={[`/promises/${startId}`]}>
      <NavigateButton to="/promises/prm_002" />
      <NavigateButton to="/promises/prm_999" />
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

    // Confirms the refreshed values actually reach the screen, not just
    // that the fetch functions were re-invoked.
    await waitFor(() => {
      expect(screen.getByText('80')).toBeInTheDocument();
    });
    expect(screen.getByText('4 check-ins')).toBeInTheDocument();
    expect(screen.getByText('Went this morning')).toBeInTheDocument();
  });

  test('shows a warning, without crashing, when the post-check-in refresh fails', async () => {
    const user = userEvent.setup();
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('Log a Check-in')).toBeInTheDocument();
    });

    // The check-in itself still succeeds; only the refresh afterward fails.
    logOutcome.mockResolvedValue(mockOutcome);
    getSelfTrust.mockRejectedValue(new Error('Network error'));
    getOutcomes.mockRejectedValue(new Error('Network error'));

    await user.click(screen.getByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Check-in saved, but the score and history could not be refreshed. Reload the page to see the latest.'
        )
      ).toBeInTheDocument();
    });

    // Screen readers need to hear this without the user having to find it.
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Check-in saved, but the score and history could not be refreshed.'
    );

    // The last successfully-fetched score stays on screen rather than
    // disappearing or crashing the page.
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  test('does not let a slower, older refresh overwrite a newer one', async () => {
    const user = userEvent.setup();
    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);
    logOutcome.mockResolvedValue(mockOutcome);

    renderWithRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('Log a Check-in')).toBeInTheDocument();
    });

    // Two check-ins logged back to back, whose refreshes resolve out of
    // order: the second (newer) refresh finishes before the first (older,
    // slower) one, simulating a real network race.
    let resolveFirst;
    const firstFetch = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    getSelfTrust
      .mockImplementationOnce(() => firstFetch.then(() => mockSelfTrust))
      .mockResolvedValueOnce({ score: 90, count: 5 });
    getOutcomes
      .mockImplementationOnce(() => firstFetch.then(() => []))
      .mockResolvedValueOnce([mockOutcome]);

    await user.click(screen.getByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));
    await user.click(screen.getByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    // The newer (second) refresh resolves first and should win.
    await waitFor(() => {
      expect(screen.getByText('90')).toBeInTheDocument();
    });

    // Now let the older, slower refresh resolve. Its stale data must not
    // overwrite what's already on screen.
    resolveFirst();
    await waitFor(() => {
      expect(getSelfTrust).toHaveBeenCalledTimes(3);
    });

    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.queryByText('72')).not.toBeInTheDocument();
  });

  test('a slow self-promise fetch left over from the previous route does not corrupt the new page', async () => {
    const user = userEvent.setup();
    getPromises.mockResolvedValue([mockSelfPromise]);

    let resolveSlowFetch;
    const slowFetch = new Promise((resolve) => {
      resolveSlowFetch = resolve;
    });
    getSelfTrust.mockImplementation(() => slowFetch.then(() => mockSelfTrust));
    getOutcomes.mockImplementation(() => slowFetch.then(() => []));

    renderWithNavigableRouter('prm_self_001');

    await waitFor(() => {
      expect(getSelfTrust).toHaveBeenCalledTimes(1);
    });

    // Navigate to a different, assessed promise while that self-promise
    // fetch is still in flight (slowFetch hasn't resolved yet).
    getPromises.mockResolvedValue([mockKeptPromise]);
    getAssessments.mockResolvedValue([
      { ...mockAssessment, promiseId: 'prm_002' },
    ]);

    await user.click(screen.getByText('navigate to /promises/prm_002'));

    await waitFor(() => {
      expect(
        screen.getByText('Build the dashboard screen')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('dev_user_001')).toBeInTheDocument();

    // Now let the stale self-promise fetch resolve. It must not overwrite
    // the assessed promise now on screen, or throw an error over it.
    resolveSlowFetch();
    await waitFor(() => {
      expect(
        screen.getByText('Build the dashboard screen')
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText('Failed to load promise details. Please try again.')
    ).not.toBeInTheDocument();
    expect(screen.getByText('dev_user_001')).toBeInTheDocument();
  });

  test('leaving the not-found state does not stick on the next route', async () => {
    const user = userEvent.setup();
    // prm_999 matches nothing, so the initial load lands on "not found".
    getPromises.mockResolvedValue([mockKeptPromise]);
    getAssessments.mockResolvedValue([]);

    renderWithNavigableRouter('prm_999');

    await waitFor(() => {
      expect(screen.getByText('Promise not found.')).toBeInTheDocument();
    });

    await user.click(screen.getByText('navigate to /promises/prm_002'));

    await waitFor(() => {
      expect(
        screen.getByText('Build the dashboard screen')
      ).toBeInTheDocument();
    });
    expect(screen.queryByText('Promise not found.')).not.toBeInTheDocument();
  });

  test("navigating between two self-promises does not show the previous one's score while the new one loads", async () => {
    const user = userEvent.setup();
    const otherSelfPromise = { ...mockSelfPromise, id: 'prm_002' };

    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithNavigableRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('72')).toBeInTheDocument();
    });

    // The next promise's own fetch is slow, so the previous score must not
    // still be showing while it's in flight.
    let resolveNext;
    const nextFetch = new Promise((resolve) => {
      resolveNext = resolve;
    });
    getPromises.mockResolvedValue([otherSelfPromise]);
    getSelfTrust.mockImplementation(() =>
      nextFetch.then(() => ({ score: 30, count: 1 }))
    );
    getOutcomes.mockImplementation(() => nextFetch.then(() => []));

    await user.click(screen.getByText('navigate to /promises/prm_002'));

    // Still loading the new promise - the old score should be gone, not
    // lingering on screen.
    await waitFor(() => {
      expect(screen.queryByText('72')).not.toBeInTheDocument();
    });

    resolveNext();
    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });

  test('a check-in still in flight when the user navigates away does not overwrite the new promise', async () => {
    const user = userEvent.setup();
    const otherSelfPromise = { ...mockSelfPromise, id: 'prm_002' };

    getPromises.mockResolvedValue([mockSelfPromise]);
    getSelfTrust.mockResolvedValue(mockSelfTrust);
    getOutcomes.mockResolvedValue([]);

    renderWithNavigableRouter('prm_self_001');

    await waitFor(() => {
      expect(screen.getByText('Log a Check-in')).toBeInTheDocument();
    });

    // The check-in's own POST is slow and still pending when the user
    // navigates away to a different self-promise.
    let resolveLogOutcome;
    logOutcome.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogOutcome = resolve;
        })
    );

    await user.click(screen.getByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    // Navigate to the other self-promise before that POST resolves.
    getPromises.mockResolvedValue([otherSelfPromise]);
    getSelfTrust.mockResolvedValue({ score: 30, count: 1 });
    getOutcomes.mockResolvedValue([]);

    await user.click(screen.getByText('navigate to /promises/prm_002'));

    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    // Now let the stale check-in's POST resolve. Its onLogged callback is
    // still bound to the old promise (prm_self_001) and must not fetch or
    // apply that promise's data over what's now on screen.
    resolveLogOutcome(mockOutcome);
    await waitFor(() => {
      expect(getSelfTrust).toHaveBeenCalledTimes(2); // initial loads only
    });

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.queryByText('72')).not.toBeInTheDocument();
  });
});
