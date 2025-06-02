import { vi } from 'vitest';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatasetProvider from '../../contexts/DatasetContext';
import ColumnSelector from '../ColumnSelector';
import ChartCanvas from '../ChartCanvas';
import MessageDisplay from '../MessageDisplay';
import ErrorModal from '../ErrorModal';

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

// Mock requestAnimationFrame
const originalRequestAnimationFrame = global.requestAnimationFrame;
beforeAll(() => {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
});

afterAll(() => {
  global.requestAnimationFrame = originalRequestAnimationFrame;
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  // Clear any lingering timeouts
  vi.useRealTimers();
});

describe('ColumnSelector and ChartCanvas Integration', () => {
  const mockData = {
    file: null,
    data: [
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
    headers: ['name', 'age', 'score', 'grade'],
    loading: false,
    error: null,
    modalError: null,
    warning: null,
    selectedX: null,
    selectedY: null,
  };

  it('ColumnSelector_ChartCanvas_updates_chart_when_dropdown_selections_change', async () => {
    render(
      <DatasetProvider initialState={mockData}>
        <ColumnSelector />
        <ChartCanvas />
        <ErrorModal />
      </DatasetProvider>,
    );

    // Initial state should show chart container
    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toBeInTheDocument();

    // Get the dropdowns
    const xAxisSelect = screen.getByLabelText('X Axis') as HTMLSelectElement;
    const yAxisSelect = screen.getByLabelText('Y Axis') as HTMLSelectElement;

    // Wait for auto-select to complete and chart to be ready
    await waitFor(() => {
      const readyState = chartContainer.getAttribute('data-ready');

      if (xAxisSelect.value !== 'age') {
        throw new Error(`Expected X axis to be 'age', got '${xAxisSelect.value}'`);
      }
      if (yAxisSelect.value !== 'score') {
        throw new Error(`Expected Y axis to be 'score', got '${yAxisSelect.value}'`);
      }
      if (readyState !== 'true') {
        throw new Error(`Expected chart to be ready, got readyState='${readyState}'`);
      }
      if (screen.queryByRole('dialog')) {
        throw new Error('Unexpected error modal present');
      }
    }, { timeout: 500, interval: 50 });

    // Change X axis to score
    // Change value directly and fire change event
    xAxisSelect.value = 'score';
    fireEvent.change(xAxisSelect);

    // If there's a modal, try to close it
    const modal = screen.queryByRole('dialog');
    if (modal) {
      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);
    }

    // Change Y axis to age
    // Change value directly and fire change event
    yAxisSelect.value = 'age';
    fireEvent.change(yAxisSelect);

    // If there's a modal, try to close it
    const modal2 = screen.queryByRole('dialog');
    if (modal2) {
      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);
    }

    // Wait for chart to update and be ready
    await waitFor(() => {
      const readyState = chartContainer.getAttribute('data-ready');

      if (xAxisSelect.value !== 'score') {
        throw new Error(`Expected X axis to be 'score', got '${xAxisSelect.value}'`);
      }
      if (yAxisSelect.value !== 'age') {
        throw new Error(`Expected Y axis to be 'age', got '${yAxisSelect.value}'`);
      }
      if (readyState !== 'true') {
        throw new Error(`Expected chart to be ready, got readyState='${readyState}'`);
      }
      if (screen.queryByRole('dialog')) {
        throw new Error('Unexpected error modal present');
      }
    }, { timeout: 500, interval: 50 });
  }, 2000);

  it('ColumnSelector_ChartCanvas_shows_error_when_same_column_selected', async () => {
    render(
      <DatasetProvider initialState={mockData}>
        <ColumnSelector />
        <MessageDisplay />
        <ChartCanvas />
        <ErrorModal />
      </DatasetProvider>,
    );

    // Get the dropdowns
    const xAxisSelect = screen.getByLabelText('X Axis') as HTMLSelectElement;
    const yAxisSelect = screen.getByLabelText('Y Axis') as HTMLSelectElement;

    // Wait for auto-select to complete and chart to be ready
    await waitFor(() => {
      const readyState = screen.getByTestId('chart-container').getAttribute('data-ready');
      expect(xAxisSelect.value).toBe('age');
      expect(yAxisSelect.value).toBe('score');
      expect(readyState).toBe('true');
    }, { timeout: 1000 });

    // Select same column for both axes
    userEvent.selectOptions(xAxisSelect, 'age');
    userEvent.selectOptions(yAxisSelect, 'age');

    // Wait for error message and chart not ready state
    await waitFor(() => {
      const readyState = screen.getByTestId('chart-container').getAttribute('data-ready');
      // Look for error message in modal
      const errorModal = screen.getByRole('dialog');
      expect(errorModal).toBeInTheDocument();
      expect(errorModal).toHaveTextContent('X and Y axes must be different columns');
      expect(readyState).toBe('false');
    }, { timeout: 1000 });

    // Close the modal
    const closeButton = screen.getByTestId('modal-close-button');
    userEvent.click(closeButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('ColumnSelector_disables_non_numeric_columns_for_Y_axis', () => {
    render(
      <DatasetProvider initialState={mockData}>
        <ColumnSelector />
        <ChartCanvas />
      </DatasetProvider>,
    );

    // Get the Y axis dropdown
    const yAxisSelect = screen.getByLabelText('Y Axis') as HTMLSelectElement;

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
