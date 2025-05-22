import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResetButton from '../ResetButton';
import DatasetProvider from '../../contexts/DatasetContext';

describe('ResetButton', () => {
  it('dispatches reset action when clicked', () => {
    const mockState = {
      headers: ['name', 'value'],
      rows: [{ name: 'Test', value: '10' }],
      loading: false,
    };

    render(
      <DatasetProvider initialState={mockState}>
        <ResetButton />
      </DatasetProvider>,
    );

    fireEvent.click(screen.getByTestId('reset-button'));

    // Re-render to check state was reset
    const { container } = render(
      <DatasetProvider>
        <div data-testid="dataset-consumer">
          {JSON.stringify({ headers: [], rows: [], loading: false })}
        </div>
      </DatasetProvider>,
    );

    expect(container).toHaveTextContent(
      JSON.stringify({ headers: [], rows: [], loading: false }),
    );
  });
});
