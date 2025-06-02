import { render, screen, fireEvent } from '@testing-library/react';
import ColumnSelector from '../ColumnSelector';
import DatasetProvider from '../../contexts/DatasetContext';

describe('ColumnSelector', () => {
  const mockState = {
    file: null,
    data: [
      { name: 'John', age: '25', score: '95' },
      { name: 'Jane', age: '30', score: '85' },
    ],
    headers: ['name', 'age', 'score'],
    loading: false,
    error: null,
    modalError: null,
    warning: null,
    modalWarning: null,
    selectedX: null,
    selectedY: null,
  };

  it('renders nothing when no headers are present', () => {
    render(
      <DatasetProvider initialState={{ ...mockState, headers: [] }}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    expect(screen.queryByLabelText('X Axis')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Y Axis')).not.toBeInTheDocument();
  });

  it('renders dropdowns with valid headers', () => {
    render(
      <DatasetProvider initialState={mockState}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    expect(screen.getByLabelText('X Axis')).toBeInTheDocument();
    expect(screen.getByLabelText('Y Axis')).toBeInTheDocument();

    // Check if all headers are present in both dropdowns
    const xAxisDropdown = screen.getByLabelText('X Axis');
    const yAxisDropdown = screen.getByLabelText('Y Axis');

    mockState.headers.forEach((header) => {
      expect(xAxisDropdown).toHaveTextContent(header);
      expect(yAxisDropdown).toHaveTextContent(header);
    });
  });

  it('skips empty headers in dropdowns', () => {
    const stateWithEmptyHeaders = {
      ...mockState,
      headers: ['name', '', 'age', '', 'score'],
    };

    render(
      <DatasetProvider initialState={stateWithEmptyHeaders}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    const xAxisDropdown = screen.getByLabelText('X Axis');
    const yAxisDropdown = screen.getByLabelText('Y Axis');

    // Should only show non-empty headers
    expect(xAxisDropdown.getElementsByTagName('option')).toHaveLength(4); // 3 headers + default option
    expect(yAxisDropdown.getElementsByTagName('option')).toHaveLength(4);
  });

  it('updates context when axes are selected', async () => {
    render(
      <DatasetProvider initialState={mockState}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    const xAxisSelect = screen.getByLabelText('X Axis');
    const yAxisSelect = screen.getByLabelText('Y Axis');

    fireEvent.change(xAxisSelect, { target: { value: 'age' } });
    fireEvent.change(yAxisSelect, { target: { value: 'score' } });

    // The actual state update will be tested in the context tests
    expect(xAxisSelect).toHaveDisplayValue('age');
    expect(yAxisSelect).toHaveDisplayValue('score');
  });

  it('disables non-numeric columns in Y-axis dropdown', () => {
    render(
      <DatasetProvider initialState={mockState}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    const yAxisDropdown = screen.getByLabelText('Y Axis');
    const nameOption = yAxisDropdown.querySelector(
      'option[value="name"]',
    ) as HTMLOptionElement;
    const ageOption = yAxisDropdown.querySelector(
      'option[value="age"]',
    ) as HTMLOptionElement;
    const scoreOption = yAxisDropdown.querySelector(
      'option[value="score"]',
    ) as HTMLOptionElement;

    expect(nameOption.disabled).toBe(true);
    expect(ageOption.disabled).toBe(false);
    expect(scoreOption.disabled).toBe(false);

    expect(nameOption.textContent).toContain('(non-numeric)');
    expect(ageOption.textContent).not.toContain('(non-numeric)');
    expect(scoreOption.textContent).not.toContain('(non-numeric)');
  });

  it('handles empty dataset gracefully', () => {
    render(
      <DatasetProvider initialState={{ ...mockState, data: [] }}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    const yAxisDropdown = screen.getByLabelText('Y Axis');
    mockState.headers.forEach((header) => {
      const option = yAxisDropdown.querySelector(
        `option[value="${header}"]`,
      ) as HTMLOptionElement;
      expect(option.disabled).toBe(true);
      expect(option.textContent).toContain('(non-numeric)');
    });
  });
});
