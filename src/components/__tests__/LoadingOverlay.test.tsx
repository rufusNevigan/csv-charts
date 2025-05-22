import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingOverlay from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders when show is true', () => {
    render(<LoadingOverlay show />);
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<LoadingOverlay show={false} />);
    expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
  });
});
