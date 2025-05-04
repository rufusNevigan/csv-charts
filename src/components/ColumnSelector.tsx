import React from 'react';
import useDataset from '../contexts/useDataset';
import detectNumericColumns from '../utils/detectNumericColumns';

function ColumnSelector() {
  const { state, dispatch } = useDataset();
  const {
    headers, rows, xKey, yKey,
  } = state;

  if (!headers || !rows || headers.length === 0) {
    return null;
  }

  const { xKey: detectedXKey, yKey: detectedYKey } = detectNumericColumns(headers, rows);
  const numericColumns = headers.filter(
    (header) => detectedXKey === header || detectedYKey === header,
  );

  const handleXAxisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_KEYS', payload: { xKey: e.target.value, yKey } });
  };

  const handleYAxisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_KEYS', payload: { xKey, yKey: e.target.value } });
  };

  return (
    <div className="flex space-x-4">
      <div>
        <label htmlFor="x-axis" className="block text-sm font-medium text-gray-700">
          X Axis
        </label>
        <select
          id="x-axis"
          value={xKey}
          onChange={handleXAxisChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="y-axis" className="block text-sm font-medium text-gray-700">
          Y Axis
        </label>
        <select
          id="y-axis"
          value={yKey}
          onChange={handleYAxisChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {headers.map((header) => (
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
