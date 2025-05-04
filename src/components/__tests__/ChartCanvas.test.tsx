import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartCanvas from '../ChartCanvas';
import DatasetProvider from '../../contexts/DatasetContext';

describe('ChartCanvas', () => {
  it('shows upload prompt when no dataset is loaded', () => {
    render(
      <DatasetProvider>
        <ChartCanvas />
      </DatasetProvider>,
    );
    expect(screen.getByText('No numeric columns found in the dataset')).toBeInTheDocument();
  });

  it('shows message when no numeric columns are detected', () => {
    const initialState = {
      headers: ['name', 'category'],
      rows: [
        { name: 'Item 1', category: 'A' },
        { name: 'Item 2', category: 'B' },
      ],
      loading: false,
    };

    render(
      <DatasetProvider initialState={initialState}>
        <ChartCanvas />
      </DatasetProvider>,
    );
    expect(screen.getByText('No numeric columns found in the dataset')).toBeInTheDocument();
  });

  it('renders chart when numeric columns are detected', () => {
    const initialState = {
      headers: ['name', 'value', 'count'],
      rows: [
        { name: 'Item 1', value: '10', count: '5' },
        { name: 'Item 2', value: '20', count: '10' },
      ],
      loading: false,
    };

    render(
      <DatasetProvider initialState={initialState}>
        <ChartCanvas />
      </DatasetProvider>,
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
});
