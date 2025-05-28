import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import ErrorModal from '../ErrorModal';
import DatasetContext, { initialState } from '../../contexts/DatasetContextDefinition';

describe('ErrorModal', () => {
  const mockDispatch = vi.fn();

  const renderWithContext = (modalError: string | null = null) => (
    render(
      <DatasetContext.Provider
        value={{
          state: { ...initialState, modalError },
          dispatch: mockDispatch,
        }}
      >
        <ErrorModal />
      </DatasetContext.Provider>,
    )
  );

  it('renders nothing when there is no modal error', () => {
    renderWithContext();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal with error message when there is a modal error', () => {
    renderWithContext('Test error message');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('dispatches CLEAR_MODAL_ERROR when closing the modal', () => {
    renderWithContext('Test error message');
    fireEvent.click(screen.getByText('Close'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CLEAR_MODAL_ERROR',
    });
  });
});
