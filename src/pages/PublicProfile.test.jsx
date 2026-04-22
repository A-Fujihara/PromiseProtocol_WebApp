import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicProfile from './PublicProfile';
import { getPromises, getAssessments } from '../services/api';

vi.mock('../services/api', () => ({
  getPromises: vi.fn(),
  getAssessments: vi.fn(),
}));

const mockPromises = [
  { id: 'p1', promiserId: 'user_1', status: 'KEPT' },
  { id: 'p2', promiserId: 'user_1', status: 'pending' },
];
const mockAssessments = [
  { id: 'a1', promiseId: 'p1', judgment: 'KEPT' },
];

describe('PublicProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  test('renders correct user profile and math', async () => {
    getPromises.mockResolvedValue(mockPromises);
    getAssessments.mockResolvedValue(mockAssessments);

    render(
      <MemoryRouter initialEntries={['/profile/user_1']}>
        <Routes><Route path="/profile/:promiserId" element={<PublicProfile />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Profile: user_1')).toBeInTheDocument());
    
    // 1 Kept Assessment / 1 Total = 100%
    expect(screen.getByText('100%')).toBeInTheDocument();
    // 1 Active, 1 Kept
    expect(screen.getAllByText('1')).toHaveLength(2);
  });
});