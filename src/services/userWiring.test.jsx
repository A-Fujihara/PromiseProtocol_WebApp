import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import PromiseDetail from '../pages/PromiseDetail';
import { CURRENT_USER } from './currentUser';

// PP-B5: unlike the page tests, which mock services/api, only the HTTP layer
// is mocked here. A regression anywhere between a page and the wire (a page
// forgetting the user, api.js dropping the param) fails these, and the mock
// answers like the PP-A6 server does: a private self-promise is only returned
// when the request carries the owner's userId, otherwise 404/hidden.

vi.mock('./httpService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import httpService from './httpService';

const selfPromise = {
  id: 'prm_self_001',
  promiserId: CURRENT_USER,
  promiseeScope: 'self',
  domain: 'Health',
  objective: 'Stretch every morning',
  successCriteria: 'Ten minutes a day',
  kind: 'self',
  visibility: 'private',
  stake: null,
  status: 'pending',
  createdAt: '2026-10-01T00:00:00.000Z',
};

const notFound = () => Promise.reject({ response: { status: 404 } });

// Mirrors server visibility: private data only when userId is the owner's.
const serverGet = (url, config = {}) => {
  const userId = config.params?.userId;
  const isOwner = userId === CURRENT_USER;

  if (url === '/api/promises') {
    return Promise.resolve({ data: isOwner ? [selfPromise] : [] });
  }
  if (url === '/api/assessments') {
    return Promise.resolve({ data: [] });
  }
  if (url === `/api/promises/${selfPromise.id}/self-trust`) {
    return isOwner
      ? Promise.resolve({ data: { score: 80, count: 2 } })
      : notFound();
  }
  if (url === '/api/outcomes') {
    return isOwner ? Promise.resolve({ data: [] }) : notFound();
  }
  return notFound();
};

beforeEach(() => {
  vi.clearAllMocks();
  httpService.get.mockImplementation(serverGet);
});

describe('PP-B5: requesting user reaches the promises API', () => {
  test('dashboard sends the current user and shows their private self-promise', async () => {
    render(<Dashboard />);

    expect(
      await screen.findByText('Stretch every morning')
    ).toBeInTheDocument();
    expect(httpService.get).toHaveBeenCalledWith('/api/promises', {
      params: { userId: CURRENT_USER },
    });
  });

  test('self-promise detail fetches self-trust and outcomes with the current user, no 404', async () => {
    render(
      <MemoryRouter initialEntries={[`/promises/${selfPromise.id}`]}>
        <Routes>
          <Route path="/promises/:id" element={<PromiseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText('Stretch every morning')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Failed to load promise details/i)
    ).not.toBeInTheDocument();

    expect(httpService.get).toHaveBeenCalledWith(
      `/api/promises/${selfPromise.id}/self-trust`,
      { params: { userId: CURRENT_USER } }
    );
    expect(httpService.get).toHaveBeenCalledWith('/api/outcomes', {
      params: { promiseId: selfPromise.id, userId: CURRENT_USER },
    });
  });

  test('logging a check-in sends the current user in the POST body', async () => {
    httpService.post.mockResolvedValue({
      data: { id: 'out_1', promiseId: selfPromise.id, outcome: 'kept' },
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[`/promises/${selfPromise.id}`]}>
        <Routes>
          <Route path="/promises/:id" element={<PromiseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(await screen.findByLabelText('I did it'));
    await user.click(screen.getByRole('button', { name: 'Log check-in' }));

    await waitFor(() => {
      expect(httpService.post).toHaveBeenCalledWith('/api/outcomes', {
        promiseId: selfPromise.id,
        outcome: 'kept',
        userId: CURRENT_USER,
      });
    });
  });
});
