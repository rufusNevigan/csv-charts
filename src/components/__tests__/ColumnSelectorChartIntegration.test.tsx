import { vi } from 'vitest';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import DatasetProvider from '../../contexts/DatasetContext';
import ColumnSelector from '../ColumnSelector';
import ChartCanvas from '../ChartCanvas';
import MessageDisplay from '../MessageDisplay';

// Mock ResizeObserver for Recharts
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.ResizeObserver = ResizeObserverMock;

describe('ColumnSelector and ChartCanvas Integration', () => {
  const mockData = {
    headers: ['name', 'age', 'score', 'grade'],
    rows: [
      {
        name: 'Alice',
        age: '25',
        score: '95',
        grade: 'A',
      },
      {
        name: 'Bob',
        age: '30',
        score: '85',
        grade: 'B',
      },
      {
        name: 'Charlie',
        age: '35',
        score: '75',
        grade: 'C',
      },
    ],
    loading: false,
  };

  it('updates chart when dropdown selections change', async () => {
    render(
      <DatasetProvider initialState={mockData}>
        <ColumnSelector />
        <ChartCanvas />
      </DatasetProvider>,
    );

    // Initial state should show chart container
    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toBeInTheDocument();

    // Get the dropdowns
    const xAxisSelect = screen.getByLabelText('X Axis');
    const yAxisSelect = screen.getByLabelText('Y Axis');

    // Change X axis to 'age' and Y axis to 'score'
    fireEvent.change(xAxisSelect, { target: { value: 'age' } });
    await waitFor(() => {
      expect(xAxisSelect).toHaveValue('age');
    });

    fireEvent.change(yAxisSelect, { target: { value: 'score' } });
    await waitFor(() => {
      expect(yAxisSelect).toHaveValue('score');
    });

    // Verify chart is still visible and ready
    expect(chartContainer).toHaveAttribute('data-ready', 'true');

    // Change to different numeric columns
    fireEvent.change(xAxisSelect, { target: { value: 'score' } });
    await waitFor(() => {
      expect(xAxisSelect).toHaveValue('score');
    });

    fireEvent.change(yAxisSelect, { target: { value: 'age' } });
    await waitFor(() => {
      expect(yAxisSelect).toHaveValue('age');
    });

    expect(chartContainer).toHaveAttribute('data-ready', 'true');
  });

  it('shows error when same column selected for both axes', async () => {
    render(
      <DatasetProvider initialState={mockData}>
        <ColumnSelector />
        <MessageDisplay />
        <ChartCanvas />
      </DatasetProvider>,
    );

    // Get the dropdowns
    const xAxisSelect = screen.getByLabelText('X Axis');
    const yAxisSelect = screen.getByLabelText('Y Axis');

    // Select same column for both axes
    fireEvent.change(xAxisSelect, { target: { value: 'age' } });
    await waitFor(() => {
      expect(xAxisSelect).toHaveValue('age');
    });

    fireEvent.change(yAxisSelect, { target: { value: 'age' } });
    await waitFor(() => {
      expect(yAxisSelect).toHaveValue('age');
    });

    // Should show error message
    await waitFor(() => {
      expect(
        screen.getByText('X and Y axes must be different columns'),
      ).toBeInTheDocument();
    });
  });

  it('disables non-numeric columns for Y axis', () => {
    render(
      <DatasetProvider initialState={mockData}>
        <ColumnSelector />
        <ChartCanvas />
      </DatasetProvider>,
    );

    // Get the Y axis dropdown
    const yAxisSelect = screen.getByLabelText('Y Axis');

    // Check that non-numeric columns are disabled
    const nameOption = yAxisSelect.querySelector(
      'option[value="name"]',
    ) as HTMLOptionElement;
    const gradeOption = yAxisSelect.querySelector(
      'option[value="grade"]',
    ) as HTMLOptionElement;
    const scoreOption = yAxisSelect.querySelector(
      'option[value="score"]',
    ) as HTMLOptionElement;

    expect(nameOption.disabled).toBe(true);
    expect(gradeOption.disabled).toBe(true);
    expect(scoreOption.disabled).toBe(false);
  });
});
