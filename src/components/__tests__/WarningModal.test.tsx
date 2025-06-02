import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import { vi } from 'vitest';
import WarningModal from '../WarningModal';
import DatasetProvider from '../../contexts/DatasetContext';
import { DatasetState } from '../../contexts/DatasetContextDefinition';

const mockDispatch = vi.fn();

// Mock the useDataset hook
vi.mock('../../contexts/useDataset', () => ({
  default: vi.fn(),
}));

// Import the mocked hook
const mockUseDataset = vi.mocked(await import('../../contexts/useDataset')).default;

const createMockState = (overrides: Partial<DatasetState> = {}): DatasetState => ({
  file: null,
  data: [],
  headers: [],
  loading: false,
  error: null,
  modalError: null,
  warning: null,
  modalWarning: null,
  selectedX: null,
  selectedY: null,
  ...overrides,
});

describe('WarningModal', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockUseDataset.mockReturnValue({
      state: createMockState({ modalWarning: 'Test warning message' }),
      dispatch: mockDispatch,
    });
  });

  it('renders warning modal when modalWarning is set', () => {
    render(
      <DatasetProvider>
        <WarningModal />
      </DatasetProvider>,
    );

    expect(screen.getByTestId('warning-modal')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByTestId('warning-modal-message')).toHaveTextContent('Test warning message');
  });

  it('dispatches CLEAR_MODAL_WARNING when close button is clicked', () => {
    render(
      <DatasetProvider>
        <WarningModal />
      </DatasetProvider>,
    );

    fireEvent.click(screen.getByTestId('modal-close-button'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLEAR_MODAL_WARNING' });
  });

  it('does not render when modalWarning is null', () => {
    mockUseDataset.mockReturnValue({
      state: createMockState({ modalWarning: null }),
      dispatch: mockDispatch,
    });

    render(
      <DatasetProvider>
        <WarningModal />
      </DatasetProvider>,
    );

    expect(screen.queryByTestId('warning-modal')).not.toBeInTheDocument();
  });
});
