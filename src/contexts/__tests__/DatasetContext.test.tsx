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
      <div data-testid="rows">{state.rows?.length}</div>
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
          payload: { xKey: 'age', yKey: 'score' },
        })}
      >
        Set Keys
      </button>
      <button
        type="button"
        data-testid="set-error"
        onClick={() => dispatch({ type: 'SET_ERROR', payload: 'Failed to parse CSV file' })}
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
      '{"headers":[],"rows":[],"loading":false}',
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
      '{"headers":[],"rows":[],"loading":true}',
    );
  });

  it('handles SET_FILE_SUCCESS action with duplicate headers', () => {
    const initialState = {
      headers: ['name', 'age', 'name'],
      rows: [{ name: 'John', age: '30', name2: 'Doe' }],
      loading: false,
      warning: 'Duplicate headers found: name',
    };

    render(
      <DatasetProvider initialState={initialState}>
        <TestComponent />
      </DatasetProvider>,
    );

    expect(screen.getByTestId('headers')).toHaveTextContent('name,age,name');
    expect(screen.getByTestId('rows')).toHaveTextContent('1');
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
        headers: [],
        rows: [],
        loading: false,
        error: 'Failed to parse CSV file',
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
        headers: [],
        rows: [],
        loading: false,
        xKey: 'age',
        yKey: 'score',
      }),
    );
  });

  it('handles RESET action', () => {
    const initialState = {
      headers: ['name', 'age'],
      rows: [{ name: 'John', age: '30' }],
      loading: true,
      xKey: 'age',
      yKey: 'name',
    };

    render(
      <DatasetProvider initialState={initialState}>
        <TestComponent />
      </DatasetProvider>,
    );

    fireEvent.click(screen.getByTestId('reset'));
    expect(screen.getByTestId('state')).toHaveTextContent(
      JSON.stringify({
        headers: [],
        rows: [],
        loading: false,
      }),
    );
  });
});
