import React, { useEffect } from 'react';
import useDataset from '../contexts/useDataset';

export default function MessageDisplay(): JSX.Element | null {
  const { state } = useDataset();
  const { error, warning } = state;

  useEffect(() => {
    console.log('MessageDisplay state:', { error, warning });
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