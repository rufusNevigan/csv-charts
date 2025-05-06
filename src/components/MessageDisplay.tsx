import { useEffect } from 'react';
import useDataset from '../contexts/useDataset';

export default function MessageDisplay(): JSX.Element | null {
  const { state } = useDataset();
  const { error, warning } = state;

  useEffect(() => {
    // Removed console.log for production
  }, [error, warning]);

  if (!error && !warning) {
    return null;
  }

  return (
    <div className="message-container" data-testid="message-container">
      {error && (
        <div className="error" role="alert" data-testid="error-message">
          {error}
        </div>
      )}
      {warning && (
        <div className="warning" role="alert" data-testid="warning-message">
          {warning}
        </div>
      )}
    </div>
  );
}
