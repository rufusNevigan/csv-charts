import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DatasetProvider from '../DatasetContext';
import useDataset from '../useDataset';

// Test component to use the context
function TestComponent() {
  const { state, dispatch } = useDataset();
  return (
    <div>
      <div data-testid="state">{JSON.stringify(state)}</div>
      <div data-testid="headers">{state.headers?.join(',')}</div>
      <div data-testid="data-length">{state.data?.length}</div>
      {state.warning && <div data-testid="warning">{state.warning}</div>}
      <button
        type="button"
        data-testid="set-file"
        onClick={() => dispatch({ type: 'SET_FILE', payload: new File([], 'test.csv') })}
      >
        Set File
      </button>
      <button
        type="button"
        data-testid="reset"
        onClick={() => dispatch({ type: 'RESET' })}
      >
        Reset
      </button>
      <button
        type="button"
        data-testid="set-keys"
        onClick={() => dispatch({
          type: 'SET_KEYS',
          payload: { x: 'age', y: 'score' },
        })}
      >
        Set Keys
      </button>
      <button
        type="button"
        data-testid="set-error"
        onClick={() => dispatch({ type: 'SET_MODAL_ERROR', payload: 'Failed to parse CSV file' })}
      >
        Set Error
      </button>
    </div>
  );
}

describe('DatasetContext', () => {
  it('provides initial state', () => {
    render(
      <DatasetProvider>
        <TestComponent />
      </DatasetProvider>,
    );
    expect(screen.getByTestId('state')).toHaveTextContent(
      JSON.stringify({
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
      }),
    );
  });

  it('handles SET_FILE action', () => {
    render(
      <DatasetProvider>
        <TestComponent />
      </DatasetProvider>,
    );
    fireEvent.click(screen.getByTestId('set-file'));
    expect(screen.getByTestId('state')).toHaveTextContent(
      JSON.stringify({
        file: {},
        data: [],
        headers: [],
        loading: true,
        error: null,
        modalError: null,
        warning: null,
        modalWarning: null,
        selectedX: null,
        selectedY: null,
      }),
    );
  });

  it('handles SET_FILE_SUCCESS action with duplicate headers', () => {
    const initialState = {
      file: null,
      data: [{ name: 'John', age: '30', name2: 'Doe' }],
      headers: ['name', 'age', 'name'],
      loading: false,
      error: null,
      modalError: null,
      warning: 'Duplicate headers found: name',
      modalWarning: null,
      selectedX: null,
      selectedY: null,
    };

    render(
      <DatasetProvider initialState={initialState}>
        <TestComponent />
      </DatasetProvider>,
    );

    expect(screen.getByTestId('headers')).toHaveTextContent('name,age,name');
    expect(screen.getByTestId('data-length')).toHaveTextContent('1');
    expect(screen.getByTestId('warning')).toHaveTextContent(
      'Duplicate headers found: name',
    );
  });

  it('handles SET_FILE_ERROR action', () => {
    render(
      <DatasetProvider>
        <TestComponent />
      </DatasetProvider>,
    );
    fireEvent.click(screen.getByTestId('set-error'));
    expect(screen.getByTestId('state')).toHaveTextContent(
      JSON.stringify({
        file: null,
        data: [],
        headers: [],
        loading: false,
        error: null,
        modalError: 'Failed to parse CSV file',
        warning: null,
        modalWarning: null,
        selectedX: null,
        selectedY: null,
      }),
    );
  });

  it('handles SET_KEYS action', () => {
    render(
      <DatasetProvider>
        <TestComponent />
      </DatasetProvider>,
    );
    fireEvent.click(screen.getByTestId('set-keys'));
    expect(screen.getByTestId('state')).toHaveTextContent(
      JSON.stringify({
        file: null,
        data: [],
        headers: [],
        loading: false,
        error: null,
        modalError: null,
        warning: null,
        modalWarning: null,
        selectedX: 'age',
        selectedY: 'score',
      }),
    );
  });

  it('handles RESET action', () => {
    const initialState = {
      file: new File([], 'test.csv'),
      data: [{ name: 'John', age: '30' }],
      headers: ['name', 'age'],
      loading: true,
      error: null,
      modalError: null,
      warning: null,
      modalWarning: null,
      selectedX: 'age',
      selectedY: 'name',
    };

    render(
      <DatasetProvider initialState={initialState}>
        <TestComponent />
      </DatasetProvider>,
    );

    fireEvent.click(screen.getByTestId('reset'));
    expect(screen.getByTestId('state')).toHaveTextContent(
      JSON.stringify({
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
      }),
    );
  });
});
