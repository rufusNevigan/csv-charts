import { render, screen } from '@testing-library/react';
import ChartCanvas from '../ChartCanvas';
import DatasetProvider from '../../contexts/DatasetContext';

// Mock ResizeObserver
class ResizeObserverMock {
  // eslint-disable-next-line class-methods-use-this
  observe(): void {}

  // eslint-disable-next-line class-methods-use-this
  unobserve(): void {}

  // eslint-disable-next-line class-methods-use-this
  disconnect(): void {}
}

global.ResizeObserver = ResizeObserverMock;

describe('ChartCanvas Validation', () => {
  it('allows categorical X-axis with numeric Y-axis', () => {
    render(
      <DatasetProvider
        initialState={{
          file: null,
          headers: ['category', 'value'],
          data: [
            { category: 'Sales', value: '50000' },
            { category: 'Marketing', value: '30000' },
          ],
          loading: false,
          error: null,
          modalError: null,
          warning: null,
          modalWarning: null,
          selectedX: 'category', // Non-numeric
          selectedY: 'value', // Numeric
          filter: '',
          filteredData: [
            { category: 'Sales', value: '50000' },
            { category: 'Marketing', value: '30000' },
          ],
          filterError: null,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    // Should render chart successfully without modal error
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true');
  });

  it('allows numeric X-axis with categorical Y-axis', () => {
    render(
      <DatasetProvider
        initialState={{
          file: null,
          headers: ['value', 'category'],
          data: [
            { value: '50000', category: 'Sales' },
            { value: '30000', category: 'Marketing' },
          ],
          loading: false,
          error: null,
          modalError: null,
          warning: null,
          modalWarning: null,
          selectedX: 'value', // Numeric
          selectedY: 'category', // Non-numeric
          filter: '',
          filteredData: [
            { value: '50000', category: 'Sales' },
            { value: '30000', category: 'Marketing' },
          ],
          filterError: null,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    // Should render chart successfully without modal error
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true');
  });

  it('shows error when both axes are non-numeric', () => {
    render(
      <DatasetProvider
        initialState={{
          file: null,
          headers: ['name', 'department'],
          data: [
            { name: 'John', department: 'Sales' },
            { name: 'Jane', department: 'Marketing' },
          ],
          loading: false,
          error: null,
          modalError: 'At least one axis must be numeric for bar chart values',
          warning: null,
          modalWarning: null,
          selectedX: 'name', // Non-numeric
          selectedY: 'department', // Non-numeric
          filter: '',
          filteredData: [
            { name: 'John', department: 'Sales' },
            { name: 'Jane', department: 'Marketing' },
          ],
          filterError: null,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    // Should not render chart when both axes are non-numeric
    expect(screen.getByTestId('chart-container')).toHaveAttribute('data-ready', 'false');
  });

  it('allows both axes to be numeric', () => {
    render(
      <DatasetProvider
        initialState={{
          file: null,
          headers: ['revenue', 'profit'],
          data: [
            { revenue: '50000', profit: '10000' },
            { revenue: '30000', profit: '5000' },
          ],
          loading: false,
          error: null,
          modalError: null,
          warning: null,
          modalWarning: null,
          selectedX: 'revenue', // Numeric
          selectedY: 'profit', // Numeric
          filter: '',
          filteredData: [
            { revenue: '50000', profit: '10000' },
            { revenue: '30000', profit: '5000' },
          ],
          filterError: null,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    // Should render chart successfully
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true');
  });
});
