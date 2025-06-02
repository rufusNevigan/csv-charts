import { useState, useCallback } from 'react';
import useDataset from '../contexts/useDataset';

export default function FilterBuilder(): JSX.Element {
  const { state, dispatch } = useDataset();
  const [inputValue, setInputValue] = useState(state.filter);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      dispatch({ type: 'SET_FILTER', payload: inputValue });
    }
  }, [dispatch, inputValue]);

  const handleApplyFilter = useCallback(() => {
    dispatch({ type: 'SET_FILTER', payload: inputValue });
  }, [dispatch, inputValue]);

  const handleClearFilter = useCallback(() => {
    setInputValue('');
    dispatch({ type: 'SET_FILTER', payload: '' });
  }, [dispatch]);

  const filteredCount = state.filteredData.length;
  const totalCount = state.data.length;

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg" data-testid="filter-builder">
      <div className="mb-2">
        <label htmlFor="filter-input" className="block text-sm font-medium text-gray-700 mb-1">
          Filter Rows
        </label>
        <div className="flex gap-2">
          <input
            id="filter-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="e.g., age > 25 or name == &quot;John&quot;"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="filter-input"
          />
          <button
            type="button"
            onClick={handleApplyFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            data-testid="apply-filter-button"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleClearFilter}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            data-testid="clear-filter-button"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p className="mb-1">
          <strong>Helper:</strong>
          {' '}
          Use expressions like
          <code>column &gt; value</code>
          ,
          <code>column == &quot;text&quot;</code>
          ,
          <code>column &lt;= 100</code>
          , or
          <code>status != &quot;inactive&quot;</code>
        </p>
        {state.filterError && (
          <p className="text-red-600 font-medium" data-testid="filter-error">
            Error:
            {' '}
            {state.filterError}
          </p>
        )}
        <p data-testid="filter-count">
          Showing
          {' '}
          {filteredCount}
          {' '}
          of
          {' '}
          {totalCount}
          {' '}
          rows
          {state.filter && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            Filter:
            {' '}
            {state.filter}
          </span>
          )}
        </p>
      </div>
    </div>
  );
}
