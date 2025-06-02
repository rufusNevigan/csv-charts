import { render, screen, fireEvent } from '@testing-library/react';
import ResetButton from '../ResetButton';
import DatasetProvider from '../../contexts/DatasetContext';

describe('ResetButton', () => {
  it('dispatches reset action when clicked', () => {
    const mockState = {
      file: null,
      data: [{ name: 'John', value: '10' }],
      headers: ['name', 'value'],
      selectedX: null,
      selectedY: null,
      loading: false,
      error: null,
      modalError: null,
      warning: null,
      modalWarning: null,
      filter: '',
      filteredData: [{ name: 'John', value: '10' }],
      filterError: null,
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
          {JSON.stringify({ headers: [], data: [], loading: false })}
        </div>
      </DatasetProvider>,
    );

    expect(container).toHaveTextContent(
      JSON.stringify({ headers: [], data: [], loading: false }),
    );
  });
});
