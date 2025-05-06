import React from 'react';
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
          headers: [],
          rows: [],
          loading: true,
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
          headers: [],
          rows: [],
          loading: false,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(screen.getByText('Upload a CSV file to visualize data')).toBeInTheDocument();
  });

  it('shows message when no numeric columns are detected', () => {
    render(
      <DatasetProvider
        initialState={{
          headers: ['name', 'email'],
          rows: [{ name: 'John', email: 'john@example.com' }],
          loading: false,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(screen.getByText('No numeric columns found in the dataset')).toBeInTheDocument();
  });

  it('renders chart when numeric columns are detected', () => {
    render(
      <DatasetProvider
        initialState={{
          headers: ['name', 'value', 'count'],
          rows: [{ name: 'John', value: '10', count: '20' }],
          loading: false,
        }}
      >
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
});
