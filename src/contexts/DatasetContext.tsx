import {
  ReactNode,
  useCallback,
  useMemo,
  useReducer,
} from 'react';
import DatasetContext, {
  DatasetState,
  DatasetAction,
  initialState,
} from './DatasetContextDefinition';
import { parseCsv } from '../utils/parseCsv';
import { InvalidFileError, DuplicateHeadersError } from '../utils/errors';

interface DatasetProviderProps {
  children: ReactNode;
  initialState?: DatasetState;
}

function reducer(state: DatasetState, action: DatasetAction): DatasetState {
  let newState: DatasetState;

  switch (action.type) {
    case 'SET_FILE':
      newState = {
        ...state,
        file: action.payload,
        // Reset data-related state when new file is set
        data: [],
        headers: [],
        selectedX: null,
        selectedY: null,
        error: null,
        modalError: null,
        warning: null,
      };
      break;

    case 'SET_DATA': {
      // Only set headers if we have data
      const headers = action.payload.length > 0 ? Object.keys(action.payload[0]) : [];
      newState = {
        ...state,
        data: action.payload,
        headers,
        loading: false, // Always set loading to false when data is set
        error: null, // Clear any previous errors
        modalError: null, // Clear any previous modal errors
      };
      break;
    }

    case 'SET_KEYS':
      newState = {
        ...state,
        selectedX: action.payload.x,
        selectedY: action.payload.y,
        error: null, // Clear any previous errors
        modalError: null, // Clear any previous modal errors
      };
      break;

    case 'SET_LOADING':
      newState = {
        ...state,
        loading: action.payload,
      };
      break;

    case 'SET_ERROR':
      newState = {
        ...state,
        error: action.payload,
        loading: false, // Always set loading to false when error occurs
      };
      break;

    case 'SET_MODAL_ERROR':
      newState = {
        ...state,
        modalError: action.payload,
        loading: false, // Always set loading to false when error occurs
      };
      break;

    case 'CLEAR_MODAL_ERROR':
      newState = {
        ...state,
        modalError: null,
      };
      break;

    case 'SET_WARNING':
      newState = {
        ...state,
        warning: action.payload,
      };
      break;

    case 'RESET':
      newState = initialState;
      break;

    default:
      throw new Error(`Unknown action type: ${(action as { type: string }).type}`);
  }

  return newState;
}

function DatasetProvider({
  children,
  initialState: providedInitialState,
}: DatasetProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ...providedInitialState,
  });

  const handleFile = useCallback(async (file: File) => {
    try {
      // First set the file and loading state
      dispatch({ type: 'SET_FILE', payload: file });
      dispatch({ type: 'SET_LOADING', payload: true });

      // Parse the CSV file
      const { rows, headers } = await parseCsv(file);

      // Set the data (this will also set loading to false)
      dispatch({ type: 'SET_DATA', payload: rows });

      // Auto-select first two numeric columns if available
      if (headers.length >= 2) {
        const numericColumns = headers.filter((header) => rows.every((row) => {
          const value = row[header];
          if (!value) return false;
          const num = Number(value);
          return !Number.isNaN(num) && typeof num === 'number';
        }));

        if (numericColumns.length >= 2) {
          dispatch({
            type: 'SET_KEYS',
            payload: { x: numericColumns[0], y: numericColumns[1] },
          });
        }
      }
    } catch (err) {
      // Handle errors and set loading to false
      if (err instanceof InvalidFileError || err instanceof DuplicateHeadersError) {
        dispatch({ type: 'SET_MODAL_ERROR', payload: err.message });
      } else if (err instanceof Error) {
        dispatch({ type: 'SET_MODAL_ERROR', payload: err.message });
      } else {
        dispatch({ type: 'SET_MODAL_ERROR', payload: 'Failed to parse CSV file' });
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
    <DatasetContext.Provider value={value}>
      {children}
    </DatasetContext.Provider>
  );
}

export default DatasetProvider;
