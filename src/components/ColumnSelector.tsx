import { ChangeEvent } from 'react';
import useDataset from '../contexts/useDataset';

function ColumnSelector(): JSX.Element | null {
  const { state, dispatch } = useDataset();
  const {
    headers, data, selectedX, selectedY,
  } = state;

  // Filter out empty headers
  const validHeaders = headers.filter(Boolean);

  // Helper to check if a column is numeric
  const isNumericColumn = (header: string): boolean => {
    if (!data || !data.length) return false;
    return data.every((row) => {
      const value = row[header];
      if (!value) return false;
      const num = Number(value);
      return !Number.isNaN(num) && typeof num === 'number';
    });
  };

  const handleXAxisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null;
    console.log('[ColumnSelector] X axis changed:', { value, selectedY });
    dispatch({
      type: 'SET_KEYS',
      payload: { x: value, y: selectedY },
    });
  };

  const handleYAxisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null;
    console.log('[ColumnSelector] Y axis changed:', { selectedX, value });
    dispatch({
      type: 'SET_KEYS',
      payload: { x: selectedX, y: value },
    });
  };

  if (!headers || headers.length === 0) {
    return null;
  }

  // Get list of numeric columns for Y-axis
  const numericColumns = validHeaders.filter(isNumericColumn);

  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1">
        <label
          htmlFor="x-axis"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          X Axis
        </label>
        <select
          id="x-axis"
          value={selectedX || ''}
          onChange={handleXAxisChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select X axis</option>
          {validHeaders.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label
          htmlFor="y-axis"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Y Axis
        </label>
        <select
          id="y-axis"
          value={selectedY || ''}
          onChange={handleYAxisChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select Y axis</option>
          {validHeaders.map((header) => (
            <option
              key={header}
              value={header}
              disabled={!numericColumns.includes(header)}
              className={numericColumns.includes(header) ? '' : 'text-gray-400'}
            >
              {header}
              {!numericColumns.includes(header) ? ' (non-numeric)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ColumnSelector;
