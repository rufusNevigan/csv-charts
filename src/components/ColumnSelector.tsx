import { ChangeEvent } from 'react';
import useDataset from '../contexts/useDataset';
import detectNumericColumns from '../utils/detectNumericColumns';

function ColumnSelector(): JSX.Element | null {
  const { state, dispatch } = useDataset();
  const { headers, xKey, yKey } = state;

  // Filter out empty headers
  const validHeaders = headers.filter(Boolean);

  const handleXAxisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: 'SET_KEYS',
      payload: { xKey: e.target.value, yKey },
    });
  };

  const handleYAxisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: 'SET_KEYS',
      payload: { xKey, yKey: e.target.value },
    });
  };

  if (!headers || headers.length === 0) {
    return null;
  }

  const { xKey: detectedXKey, yKey: detectedYKey } = detectNumericColumns(headers, state.rows);
  const numericColumns = headers.filter(
    (header) => detectedXKey === header || detectedYKey === header,
  );

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
          value={xKey || ''}
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
          value={yKey || ''}
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
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ColumnSelector;
