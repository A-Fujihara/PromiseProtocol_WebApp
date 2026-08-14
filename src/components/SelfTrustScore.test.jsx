import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SelfTrustScore from './SelfTrustScore';

describe('SelfTrustScore', () => {
  test('renders fresh state: score 50, count 0', () => {
    render(<SelfTrustScore score={50} count={0} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText('Self-Trust Score')).toBeInTheDocument();
    expect(screen.getByText('0 check-ins')).toBeInTheDocument();
  });

  test('renders low score with low range styling', () => {
    render(<SelfTrustScore score={22} count={4} />);
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('4 check-ins')).toBeInTheDocument();
    expect(screen.getByText('Needs attention')).toBeInTheDocument();
    const container = screen.getByText('22').closest('div[data-range]');
    expect(container).toHaveAttribute('data-range', 'low');
  });

  test('renders high score with high range styling', () => {
    render(<SelfTrustScore score={88} count={17} />);
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('17 check-ins')).toBeInTheDocument();
    expect(screen.getByText('Strong')).toBeInTheDocument();
    const container = screen.getByText('88').closest('div[data-range]');
    expect(container).toHaveAttribute('data-range', 'high');
  });

  test('mid-range score renders "Building" tag', () => {
    render(<SelfTrustScore score={55} count={2} />);
    expect(screen.getByText('Building')).toBeInTheDocument();
    const container = screen.getByText('55').closest('div[data-range]');
    expect(container).toHaveAttribute('data-range', 'mid');
  });

  test('singular check-in label when count is 1', () => {
    render(<SelfTrustScore score={60} count={1} />);
    expect(screen.getByText('1 check-in')).toBeInTheDocument();
  });
});
