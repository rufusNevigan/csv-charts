import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChartCanvas from '../ChartCanvas';
import DatasetProvider from '../../contexts/DatasetContext';

// Mock ResizeObserver for Recharts
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock getBoundingClientRect to return non-zero dimensions
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 500,
    height: 500,
    top: 0,
    left: 0,
    bottom: 500,
    right: 500,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));
});

afterAll(() => {
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
});

describe('ChartCanvas', () => {
  test('shows upload prompt when no dataset is loaded', () => {
    render(
      <DatasetProvider>
        <ChartCanvas />
      </DatasetProvider>,
    );
    expect(
      screen.getByText('Upload a CSV file to visualize data'),
    ).toBeInTheDocument();
  });

  test('shows message when no numeric columns are detected', () => {
    const mockState = {
      file: null,
      data: [
        { name: 'Alice', city: 'New York', empty: '' },
        { name: 'Bob', city: 'Los Angeles', empty: '' },
      ],
      headers: ['name', 'city', 'empty'],
      loading: false,
      error: null,
      modalError: null,
      warning: null,
      modalWarning: null,
      selectedX: null,
      selectedY: null,
      filter: '',
      filteredData: [
        { name: 'Alice', city: 'New York', empty: '' },
        { name: 'Bob', city: 'Los Angeles', empty: '' },
      ],
      filterError: null,
    };

    render(
      <DatasetProvider initialState={mockState}>
        <ChartCanvas />
      </DatasetProvider>,
    );
    expect(
      screen.getByText('No numeric columns found in the dataset'),
    ).toBeInTheDocument();
  });

  test('renders chart when numeric columns are detected', () => {
    const mockState = {
      file: null,
      data: [
        { value: '10', count: '5' },
        { value: '20', count: '3' },
      ],
      headers: ['value', 'count'],
      loading: false,
      error: null,
      modalError: null,
      warning: null,
      modalWarning: null,
      selectedX: 'value',
      selectedY: 'count',
      filter: '',
      filteredData: [
        { value: '10', count: '5' },
        { value: '20', count: '3' },
      ],
      filterError: null,
    };

    render(
      <DatasetProvider initialState={mockState}>
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
});
