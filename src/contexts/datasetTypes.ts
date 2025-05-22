export interface DatasetState {
  headers: string[];
  rows: Record<string, string>[];
  xKey?: string;
  yKey?: string;
  loading: boolean;
  error?: string;
  warning?: string;
}

export type DatasetAction =
  | { type: 'SET_FILE'; payload: File }
  | {
    type: 'SET_DATA';
    payload: { headers: string[]; rows: Record<string, string>[] };
  }
  | { type: 'SET_KEYS'; payload: { xKey?: string; yKey?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'SET_WARNING'; payload?: string }
  | { type: 'RESET' };

export const initialState: DatasetState = {
  headers: [],
  rows: [],
  loading: false,
};
