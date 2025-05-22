import React from 'react';
import useDataset from '../contexts/useDataset';

function ResetButton(): JSX.Element {
  const { dispatch } = useDataset();

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      className="fixed top-4 right-4 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
      data-testid="reset-button"
    >
      Reset
    </button>
  );
}

export default ResetButton;
