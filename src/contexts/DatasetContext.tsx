import {
  useReducer, ReactNode, useCallback, useMemo,
} from 'react';
import {
  parseCsv,
  InvalidFileError,
  DuplicateHeadersError,
} from '../utils/parseCsv';
import { info, error as logError } from '../utils/logger';
import { DatasetState, DatasetAction, initialState } from './datasetTypes';
import DatasetContext from './DatasetContextDefinition';

function datasetReducer(
  state: DatasetState,
  action: DatasetAction,
): DatasetState {
  switch (action.type) {
    case 'SET_FILE':
      info('File selected for parsing', { filename: action.payload.name });
      return {
        ...initialState, // Reset to initial state when new file is selected
        loading: true,
      };
    case 'SET_DATA': {
      // Check for missing values
      const hasMissingValues = action.payload.rows.some((row) => Object.values(row).some((value) => value === ''));
      const warning = hasMissingValues
        ? 'Warning: Some rows contain missing values'
        : undefined;

      // Find numeric columns and set initial x/y keys
      const numericColumns = action.payload.rows.length > 0
        ? action.payload.headers.filter((header) => action.payload.rows.every((row) => {
          const value = row[header];
          if (!value) return false;
          const num = Number(value);
          return !Number.isNaN(num) && typeof num === 'number';
        }))
        : [];

      const [firstNumeric, secondNumeric] = numericColumns;

      return {
        ...state,
        headers: action.payload.headers,
        rows: action.payload.rows,
        loading: false,
        error: undefined,
        warning,
        // Set initial x/y keys if we have numeric columns
        ...(numericColumns.length >= 2 && {
          xKey: firstNumeric,
          yKey: secondNumeric,
        }),
      };
    }
    case 'SET_KEYS': {
      info('Chart keys updated', {
        xKey: action.payload.xKey,
        yKey: action.payload.yKey,
      });
      const errorMessage = action.payload.xKey === action.payload.yKey
        ? 'X and Y axes must be different columns'
        : undefined;
      return {
        ...state,
        xKey: action.payload.xKey,
        yKey: action.payload.yKey,
        error: errorMessage,
      };
    }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      logError('CSV parsing failed', { error: action.payload });
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
      if (
        err instanceof InvalidFileError
        || err instanceof DuplicateHeadersError
      ) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      } else if (err instanceof Error) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to parse CSV file' });
      }
    }
  }, []);

  const contextDispatch = useCallback(
    (action: DatasetAction) => {
      if (action.type === 'SET_FILE') {
        handleFile(action.payload);
      } else {
        dispatch(action);
      }
    },
    [handleFile],
  );

  const value = useMemo(
    () => ({
      state,
      dispatch: contextDispatch,
    }),
    [state, contextDispatch],
  );

  return (
    <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
  );
}

export default DatasetProvider;
