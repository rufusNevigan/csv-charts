import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SampleBarChart from '../components/SampleBarChart';

// Mock ResizeObserver
class ResizeObserverMock {
  // eslint-disable-next-line class-methods-use-this
  observe() {}

  // eslint-disable-next-line class-methods-use-this
  unobserve() {}

  // eslint-disable-next-line class-methods-use-this
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

describe('SampleBarChart', () => {
  it('renders chart container with correct dimensions', () => {
    render(<SampleBarChart />);

    const container = screen.getByTestId('chart-container');
    expect(container).toHaveStyle({
      width: '100%',
      height: '400px',
      minWidth: '300px',
    });
  });

  it('renders chart with bars', () => {
    render(<SampleBarChart />);

    // Check for bar elements (indicates chart is rendered)
    const bars = document.querySelectorAll('.recharts-bar-rectangle');
    expect(bars.length).toBe(3); // We have 3 data points
  });
});
