import React, {
  ReactNode, useReducer, useMemo, useCallback,
} from 'react';
import { parseCsv } from '../utils/parseCsv';
import { info, error } from '../utils/logger';
import { DatasetState, DatasetAction, initialState } from './datasetTypes';
import DatasetContext from './DatasetContextDefinition';

function datasetReducer(state: DatasetState, action: DatasetAction): DatasetState {
  switch (action.type) {
    case 'SET_FILE':
      info('File selected for parsing', { filename: action.payload.name });
      return {
        ...state,
        loading: true,
        error: undefined,
      };
    case 'SET_DATA':
      return {
        ...state,
        headers: action.payload.headers,
        rows: action.payload.rows,
        loading: false,
        error: undefined,
      };
    case 'SET_KEYS':
      info('Chart keys updated', {
        xKey: action.payload.xKey,
        yKey: action.payload.yKey,
      });
      return {
        ...state,
        xKey: action.payload.xKey,
        yKey: action.payload.yKey,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      error('CSV parsing failed', { error: action.payload });
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_WARNING':
      info('Warning set', { warning: action.payload });
      return {
        ...state,
        warning: action.payload,
      };
    case 'RESET':
      info('Dataset state reset');
      return initialState;
    default:
      return state;
  }
}

interface DatasetProviderProps {
  children: ReactNode;
  initialState?: DatasetState;
}

function DatasetProvider({
  children,
  initialState: providedInitialState,
}: DatasetProviderProps) {
  const [state, dispatch] = useReducer(
    datasetReducer,
    providedInitialState || initialState,
  );

  const handleFile = useCallback(async (file: File) => {
    try {
      dispatch({ type: 'SET_FILE', payload: file });
      const result = await parseCsv(file);
      dispatch({ type: 'SET_DATA', payload: result });
    } catch (err) {
      if (err instanceof Error) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'An unknown error occurred' });
      }
    }
  }, []);

  const contextDispatch = useCallback((action: DatasetAction) => {
    if (action.type === 'SET_FILE') {
      handleFile(action.payload);
    } else {
      dispatch(action);
    }
  }, [handleFile]);

  const value = useMemo(() => ({
    state,
    dispatch: contextDispatch,
  }), [state, contextDispatch]);

  return (
    <DatasetContext.Provider value={value}>
      {children}
    </DatasetContext.Provider>
  );
}

export default DatasetProvider;
