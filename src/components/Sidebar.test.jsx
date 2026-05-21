import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

function renderWithRouter(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  test('renders all nav links', () => {
    renderWithRouter();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Promises')).toBeInTheDocument();
    expect(screen.getByText('New Promise')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('Dashboard link is active when on /', () => {
    renderWithRouter('/');
    const link = screen.getByText('Dashboard').closest('a');
    expect(link.className).toMatch(/navLinkActive/);
  });

  test('My Promises link is active when on /promises', () => {
    renderWithRouter('/promises');
    const link = screen.getByText('My Promises').closest('a');
    expect(link.className).toMatch(/navLinkActive/);
  });

  test('New Promise link is active when on /create', () => {
    renderWithRouter('/create');
    const link = screen.getByText('New Promise').closest('a');
    expect(link.className).toMatch(/navLinkActive/);
  });

  test('Profile link is active when on /profile', () => {
    renderWithRouter('/profile');
    const link = screen.getByText('Profile').closest('a');
    expect(link.className).toMatch(/navLinkActive/);
  });

  test('renders user name and role from mockUser', () => {
    renderWithRouter();
    expect(screen.getByText('Dev User')).toBeInTheDocument();
    expect(screen.getByText('Promiser')).toBeInTheDocument();
  });
});
