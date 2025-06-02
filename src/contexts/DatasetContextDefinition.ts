import { createContext, Dispatch } from 'react';

export type DatasetRow = Record<string, string>;

export interface DatasetState {
  file: File | null;
  data: DatasetRow[];
  headers: string[];
  loading: boolean;
  error: string | null;
  modalError: string | null;
  warning: string | null;
  modalWarning: string | null;
  selectedX: string | null;
  selectedY: string | null;
}

export type DatasetAction =
  | { type: 'SET_FILE'; payload: File }
  | { type: 'SET_DATA'; payload: DatasetRow[] }
  | { type: 'SET_KEYS'; payload: { x: string | null; y: string | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MODAL_ERROR'; payload: string | null }
  | { type: 'CLEAR_MODAL_ERROR' }
  | { type: 'SET_WARNING'; payload: string | null }
  | { type: 'SET_MODAL_WARNING'; payload: string | null }
  | { type: 'CLEAR_MODAL_WARNING' }
  | { type: 'RESET' };

export const initialState: DatasetState = {
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
};

const DatasetContext = createContext<{
  state: DatasetState;
  dispatch: Dispatch<DatasetAction>;
} | undefined>(undefined);

export default DatasetContext;
