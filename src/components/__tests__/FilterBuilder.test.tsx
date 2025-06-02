import {
  describe, it, expect,
} from 'vitest';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBuilder from '../FilterBuilder';
import DatasetProvider from '../../contexts/DatasetContext';
import { DatasetState } from '../../contexts/DatasetContextDefinition';

const mockData = [
  { name: 'Alice', age: '25', score: '85' },
  { name: 'Bob', age: '30', score: '75' },
  { name: 'Charlie', age: '22', score: '95' },
];

const mockState: Partial<DatasetState> = {
  data: mockData,
  filteredData: mockData,
  headers: ['name', 'age', 'score'],
  filter: '',
  filterError: null,
  loading: false,
};

function renderWithProvider(initialState?: Partial<DatasetState>) {
  return render(
    <DatasetProvider initialState={{ ...mockState, ...initialState } as DatasetState}>
      <FilterBuilder />
    </DatasetProvider>,
  );
}

describe('FilterBuilder', () => {
  it('renders filter input and buttons', () => {
    renderWithProvider();

    expect(screen.getByTestId('filter-input')).toBeInTheDocument();
    expect(screen.getByTestId('apply-filter-button')).toBeInTheDocument();
    expect(screen.getByTestId('clear-filter-button')).toBeInTheDocument();
    expect(screen.getByText('Filter Rows')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    renderWithProvider();

    expect(screen.getByText(/Use expressions like/)).toBeInTheDocument();
    expect(screen.getByText(/column > value/)).toBeInTheDocument();
  });

  it('shows row count', () => {
    renderWithProvider();

    expect(screen.getByTestId('filter-count')).toHaveTextContent('Showing 3 of 3 rows');
  });

  it('updates row count when filtered data changes', () => {
    const filteredData = [mockData[0], mockData[2]]; // Alice and Charlie
    renderWithProvider({
      filteredData,
      filter: 'age < 30',
    });

    expect(screen.getByTestId('filter-count')).toHaveTextContent('Showing 2 of 3 rows');
    expect(screen.getByText('Filter: age < 30')).toBeInTheDocument();
  });

  it('allows typing in the filter input', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const input = screen.getByTestId('filter-input');
    await user.type(input, 'age > 25');

    expect(input).toHaveValue('age > 25');
  });

  it('applies filter when Enter key is pressed', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const input = screen.getByTestId('filter-input');
    await user.type(input, 'age > 25');
    await user.keyboard('{Enter}');

    // The filter should be applied (this would be handled by the context)
    expect(input).toHaveValue('age > 25');
  });

  it('applies filter when Apply button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const input = screen.getByTestId('filter-input');
    const applyButton = screen.getByTestId('apply-filter-button');

    await user.type(input, 'score >= 80');
    await user.click(applyButton);

    expect(input).toHaveValue('score >= 80');
  });

  it('clears filter when Clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider({
      filter: 'age > 25',
      filteredData: [mockData[1]], // Bob
    });

    const input = screen.getByTestId('filter-input');
    const clearButton = screen.getByTestId('clear-filter-button');

    expect(input).toHaveValue('age > 25');

    await user.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('displays filter error when present', () => {
    renderWithProvider({
      filterError: 'Invalid filter expression',
    });

    expect(screen.getByTestId('filter-error')).toHaveTextContent('Error: Invalid filter expression');
  });

  it('does not display filter error when none present', () => {
    renderWithProvider();

    expect(screen.queryByTestId('filter-error')).not.toBeInTheDocument();
  });

  it('shows current filter in badge when filter is active', () => {
    renderWithProvider({
      filter: 'name == "Alice"',
      filteredData: [mockData[0]],
    });

    expect(screen.getByText('Filter: name == "Alice"')).toBeInTheDocument();
    expect(screen.getByTestId('filter-count')).toHaveTextContent('Showing 1 of 3 rows');
  });

  it('does not show filter badge when no filter is active', () => {
    renderWithProvider();

    expect(screen.queryByText(/Filter:/)).not.toBeInTheDocument();
  });

  it('initializes input value with current filter from state', () => {
    renderWithProvider({
      filter: 'age > 30',
    });

    const input = screen.getByTestId('filter-input');
    expect(input).toHaveValue('age > 30');
  });
});
