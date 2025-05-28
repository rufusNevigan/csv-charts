/* eslint-disable no-console */
import { vi } from 'vitest';
import {
  render, screen, waitFor, act, fireEvent,
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
  jest.useRealTimers();
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
    console.log('[Test] Starting dropdown selections change test');
    console.log('[Test] Rendering components with initial state:', mockData);
    
    render(
      <DatasetProvider initialState={mockData}>
        <ColumnSelector />
        <ChartCanvas />
        <ErrorModal />
      </DatasetProvider>,
    );

    // Initial state should show chart container
    const chartContainer = screen.getByTestId('chart-container');
    console.log('[Test] Chart container found, data-ready:', chartContainer.getAttribute('data-ready'));
    expect(chartContainer).toBeInTheDocument();

    // Get the dropdowns
    const xAxisSelect = screen.getByLabelText('X Axis') as HTMLSelectElement;
    const yAxisSelect = screen.getByLabelText('Y Axis') as HTMLSelectElement;
    console.log('[Test] Initial dropdown values:', {
      xAxis: xAxisSelect.value,
      yAxis: yAxisSelect.value,
      xOptions: Array.from(xAxisSelect.options).map(opt => opt.value),
      yOptions: Array.from(yAxisSelect.options).map(opt => opt.value),
      modalPresent: screen.queryByRole('dialog') !== null
    });

    // Wait for auto-select to complete and chart to be ready
    console.log('[Test] Waiting for auto-select and initial chart ready state');
    try {
      await waitFor(() => {
        const readyState = chartContainer.getAttribute('data-ready');
        const currentState = {
          xValue: xAxisSelect.value,
          yValue: yAxisSelect.value,
          readyState,
          xOptions: Array.from(xAxisSelect.options).map(opt => opt.value),
          yOptions: Array.from(yAxisSelect.options).map(opt => opt.value),
          modalPresent: screen.queryByRole('dialog') !== null
        };
        console.log('[Test] Current state:', currentState);
        
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
    } catch (error) {
      console.error('[Test] Failed waiting for initial state:', error);
      throw error;
    }

    // Change X axis to score
    console.log('[Test] Changing X axis to score');
    console.log('[Test] Before change - X axis:', {
      currentValue: xAxisSelect.value,
      newValue: 'score',
      readyState: chartContainer.getAttribute('data-ready'),
      modalPresent: screen.queryByRole('dialog') !== null
    });
    
    try {
      // Change value directly and fire change event
      xAxisSelect.value = 'score';
      fireEvent.change(xAxisSelect);
      
      console.log('[Test] After X axis change:', {
        xValue: xAxisSelect.value,
        yValue: yAxisSelect.value,
        readyState: chartContainer.getAttribute('data-ready'),
        modalPresent: screen.queryByRole('dialog') !== null
      });

      // If there's a modal, try to close it
      const modal = screen.queryByRole('dialog');
      if (modal) {
        console.log('[Test] Found modal after X axis change, attempting to close');
        const closeButton = screen.getByTestId('modal-close-button');
        fireEvent.click(closeButton);
      }
    } catch (error) {
      console.error('[Test] Failed changing X axis:', error);
      throw error;
    }

    // Change Y axis to age
    console.log('[Test] Changing Y axis to age');
    console.log('[Test] Before change - Y axis:', {
      currentValue: yAxisSelect.value,
      newValue: 'age',
      readyState: chartContainer.getAttribute('data-ready'),
      modalPresent: screen.queryByRole('dialog') !== null
    });
    
    try {
      // Change value directly and fire change event
      yAxisSelect.value = 'age';
      fireEvent.change(yAxisSelect);
      
      console.log('[Test] After Y axis change:', {
        xValue: xAxisSelect.value,
        yValue: yAxisSelect.value,
        readyState: chartContainer.getAttribute('data-ready'),
        modalPresent: screen.queryByRole('dialog') !== null
      });

      // If there's a modal, try to close it
      const modal = screen.queryByRole('dialog');
      if (modal) {
        console.log('[Test] Found modal after Y axis change, attempting to close');
        const closeButton = screen.getByTestId('modal-close-button');
        fireEvent.click(closeButton);
      }
    } catch (error) {
      console.error('[Test] Failed changing Y axis:', error);
      throw error;
    }

    // Wait for chart to update and be ready
    console.log('[Test] Waiting for chart to be ready after selection changes');
    try {
      await waitFor(() => {
        const readyState = chartContainer.getAttribute('data-ready');
        const currentState = {
          xValue: xAxisSelect.value,
          yValue: yAxisSelect.value,
          readyState,
          xOptions: Array.from(xAxisSelect.options).map(opt => opt.value),
          yOptions: Array.from(yAxisSelect.options).map(opt => opt.value),
          modalPresent: screen.queryByRole('dialog') !== null
        };
        console.log('[Test] Current state:', currentState);
        
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
    } catch (error) {
      console.error('[Test] Failed waiting for final state:', error);
      throw error;
    }

    console.log('[Test] Test completed successfully');
  }, 2000);

  it('ColumnSelector_ChartCanvas_shows_error_when_same_column_selected', async () => {
    console.log('[Test] Starting same column selection test');
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
    console.log('[Test] Waiting for auto-select and initial chart ready state');
    await waitFor(() => {
      const readyState = screen.getByTestId('chart-container').getAttribute('data-ready');
      console.log('[Test] Current state:', {
        xValue: xAxisSelect.value,
        yValue: yAxisSelect.value,
        readyState,
      });
      expect(xAxisSelect.value).toBe('age');
      expect(yAxisSelect.value).toBe('score');
      expect(readyState).toBe('true');
    }, { timeout: 1000 });

    // Select same column for both axes
    console.log('[Test] Setting both axes to age');
    userEvent.selectOptions(xAxisSelect, 'age');
    userEvent.selectOptions(yAxisSelect, 'age');

    // Wait for error message and chart not ready state
    console.log('[Test] Waiting for error message and chart not ready state');
    await waitFor(() => {
      const readyState = screen.getByTestId('chart-container').getAttribute('data-ready');
      console.log('[Test] Current state:', {
        xValue: xAxisSelect.value,
        yValue: yAxisSelect.value,
        readyState,
      });
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

    console.log('[Test] Same column test completed successfully');
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
