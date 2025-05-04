import { createContext } from 'react';
import { DatasetState, DatasetAction } from './datasetTypes';

interface DatasetContextType {
  state: DatasetState;
  dispatch: React.Dispatch<DatasetAction>;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export default DatasetContext;
