import { render, screen } from '@testing-library/react';
import ChartCanvas from '../components/ChartCanvas';
import DatasetProvider from '../contexts/DatasetContext';

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

describe('ChartCanvas', () => {
  it('shows loading spinner when loading is true', () => {
    render(
      <DatasetProvider
        initialState={{
          file: null,
          headers: [],
          data: [],
          loading: true,
          error: null,
          modalError: null,
          warning: null,
          modalWarning: null,
          selectedX: null,
          selectedY: null,
          filter: '',
          filteredData: [],
          filterError: null,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows upload prompt when no dataset is loaded', () => {
    render(
      <DatasetProvider
        initialState={{
          file: null,
          headers: [],
          data: [],
          loading: false,
          error: null,
          modalError: null,
          warning: null,
          modalWarning: null,
          selectedX: null,
          selectedY: null,
          filter: '',
          filteredData: [],
          filterError: null,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(
      screen.getByText('Upload a CSV file to visualize data'),
    ).toBeInTheDocument();
  });

  it('shows message when no numeric columns are detected', () => {
    render(
      <DatasetProvider
        initialState={{
          file: null,
          headers: ['name', 'email'],
          data: [{ name: 'John', email: 'john@example.com' }],
          loading: false,
          error: null,
          modalError: null,
          warning: null,
          modalWarning: null,
          selectedX: null,
          selectedY: null,
          filter: '',
          filteredData: [{ name: 'John', email: 'john@example.com' }],
          filterError: null,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(
      screen.getByText('At least one numeric column is required for chart visualization'),
    ).toBeInTheDocument();
  });

  it('renders chart when numeric columns are detected', () => {
    render(
      <DatasetProvider
        initialState={{
          file: null,
          headers: ['name', 'value', 'count'],
          data: [
            { name: 'Alice', value: '10', count: '5' },
            { name: 'Bob', value: '20', count: '3' },
          ],
          loading: false,
          error: null,
          modalError: null,
          warning: null,
          modalWarning: null,
          selectedX: null,
          selectedY: null,
          filter: '',
          filteredData: [
            { name: 'Alice', value: '10', count: '5' },
            { name: 'Bob', value: '20', count: '3' },
          ],
          filterError: null,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
});
