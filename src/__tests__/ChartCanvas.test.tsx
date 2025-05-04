import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartCanvas } from '../components/ChartCanvas';
import { DatasetProvider } from '../contexts/DatasetContext';

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

describe('ChartCanvas', () => {
  it('shows upload prompt when no dataset is loaded', () => {
    render(
      <DatasetProvider>
        <ChartCanvas />
      </DatasetProvider>
    );

    expect(screen.getByText('No numeric columns found in the dataset')).toBeInTheDocument();
  });

  it('shows message when no numeric columns are detected', () => {
    render(
      <DatasetProvider initialState={{ 
        headers: ['name', 'category'], 
        rows: [
          { name: 'John', category: 'A' },
          { name: 'Jane', category: 'B' }
        ], 
        loading: false 
      }}>
        <ChartCanvas />
      </DatasetProvider>
    );

    expect(screen.getByText('No numeric columns found in the dataset')).toBeInTheDocument();
  });

  it('renders chart when numeric columns are detected', () => {
    render(
      <DatasetProvider initialState={{ 
        headers: ['name', 'value', 'count'], 
        rows: [
          { name: 'John', value: '10', count: '20' },
          { name: 'Jane', value: '15', count: '25' }
        ],
        loading: false
      }}>
        <ChartCanvas />
      </DatasetProvider>
    );

    const container = screen.getByTestId('chart-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveStyle({
      width: '100%',
      height: '100%'
    });
  });
}); 