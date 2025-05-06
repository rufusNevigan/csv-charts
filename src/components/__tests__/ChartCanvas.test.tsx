import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartCanvas from '../ChartCanvas';
import DatasetProvider from '../../contexts/DatasetContext';

describe('ChartCanvas', () => {
  test('shows upload prompt when no dataset is loaded', () => {
    render(
      <DatasetProvider>
        <ChartCanvas />
      </DatasetProvider>,
    );
    expect(screen.getByText('Upload a CSV file to visualize data')).toBeInTheDocument();
  });

  test('shows message when no numeric columns are detected', () => {
    const mockState = {
      headers: ['name', 'city'],
      rows: [{ name: 'John', city: 'NY' }],
      loading: false,
      error: undefined,
    };

    render(
      <DatasetProvider initialState={mockState}>
        <ChartCanvas />
      </DatasetProvider>,
    );
    expect(screen.getByText('No numeric columns found in the dataset')).toBeInTheDocument();
  });

  test('renders chart when numeric columns are detected', () => {
    const mockState = {
      headers: ['value', 'count'],
      rows: [
        { value: '1', count: '10' },
        { value: '2', count: '20' },
      ],
      loading: false,
      error: undefined,
      xKey: 'value',
      yKey: 'count',
    };

    render(
      <DatasetProvider initialState={mockState}>
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
});
