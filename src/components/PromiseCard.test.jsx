import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PromiseCard from './PromiseCard';

const basePromise = {
  id: 'prm_001',
  promiserId: 'dev_user_001',
  promiseeScope: 'individual',
  domain: 'Web Dev',
  objective: 'Build the dashboard screen',
  timeline: 30,
  successCriteria: 'Dashboard renders with real data',
  status: 'pending',
  createdAt: '2026-04-01T00:00:00.000Z',
};

describe('PromiseCard', () => {
  test('renders financial stake correctly', () => {
    render(
      <PromiseCard
        promise={{
          ...basePromise,
          stake: { type: 'financial', amount: 100, status: 'held' },
        }}
      />
    );

    expect(screen.getByText('$100 deposited')).toBeInTheDocument();
  });

  test('renders reputational stake correctly', () => {
    render(
      <PromiseCard
        promise={{
          ...basePromise,
          stake: { type: 'reputational', amount: null, status: 'held' },
        }}
      />
    );

    expect(screen.getByText('Reputation deposited')).toBeInTheDocument();
  });

  test('renders "No deposit" instead of crashing when stake is null (self-promise)', () => {
    render(
      <PromiseCard
        promise={{
          ...basePromise,
          kind: 'self',
          visibility: 'private',
          stake: null,
        }}
      />
    );

    expect(screen.getByText('No deposit')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('◎')).not.toBeInTheDocument();
  });
});
