import { render, screen, fireEvent } from '@testing-library/react';
import {
  vi, describe, it, beforeAll, afterAll, expect,
} from 'vitest';
import AppErrorBoundary from '../AppErrorBoundary';

// Mock console.error to avoid test output noise
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

beforeAll(() => {
  // Console is already mocked above
});

afterAll(() => {
  mockConsoleError.mockRestore();
});

const ThrowError = () => {
  throw new Error('Test error');
};

describe('AppErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <AppErrorBoundary>
        <div>Test content</div>
      </AppErrorBoundary>,
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <AppErrorBoundary>
        <ThrowError />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('provides a refresh button that reloads the page', () => {
    const reloadMock = vi.fn();
    const originalLocation = window.location;

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <AppErrorBoundary>
        <ThrowError />
      </AppErrorBoundary>,
    );

    fireEvent.click(screen.getByText('Refresh Page'));
    expect(reloadMock).toHaveBeenCalled();

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });
});
