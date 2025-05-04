import { useContext } from 'react';
import DatasetContext from './DatasetContextDefinition';

function useDataset() {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}

export default useDataset;
