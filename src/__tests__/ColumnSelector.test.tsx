import { render, screen, fireEvent } from '@testing-library/react';
import DatasetProvider from '../contexts/DatasetContext';
import ColumnSelector from '../components/ColumnSelector';

describe('ColumnSelector', () => {
  const mockData = {
    headers: ['name', 'age', 'score'],
    rows: [
      { name: 'Alice', age: '25', score: '85' },
      { name: 'Bob', age: '30', score: '92' },
      { name: 'Charlie', age: '35', score: '78' },
    ],
  };

  it('renders nothing when no headers are present', () => {
    render(
      <DatasetProvider initialState={{ headers: [], rows: [], loading: false }}>
        <ColumnSelector />
      </DatasetProvider>,
    );
    expect(screen.queryByText('X Axis')).not.toBeInTheDocument();
  });

  it('renders selectors for X and Y axes when headers are present', () => {
    render(
      <DatasetProvider initialState={{ ...mockData, loading: false }}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    expect(screen.getByLabelText('X Axis')).toBeInTheDocument();
    expect(screen.getByLabelText('Y Axis')).toBeInTheDocument();
  });

  it('disables non-numeric columns in Y axis selector', () => {
    render(
      <DatasetProvider initialState={{ ...mockData, loading: false }}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    const yAxisSelect = screen.getByLabelText('Y Axis');
    const nameOption = yAxisSelect.querySelector('option[value="name"]');
    const ageOption = yAxisSelect.querySelector('option[value="age"]');

    expect(nameOption).toHaveAttribute('disabled');
    expect(ageOption).not.toHaveAttribute('disabled');
  });

  it('updates selected columns when options are changed', () => {
    render(
      <DatasetProvider initialState={{ ...mockData, loading: false }}>
        <ColumnSelector />
      </DatasetProvider>,
    );

    const xAxisSelect = screen.getByLabelText('X Axis');
    const yAxisSelect = screen.getByLabelText('Y Axis');

    fireEvent.change(xAxisSelect, { target: { value: 'age' } });
    fireEvent.change(yAxisSelect, { target: { value: 'score' } });

    expect(xAxisSelect).toHaveValue('age');
    expect(yAxisSelect).toHaveValue('score');
  });
});
