import DatasetProvider from './contexts/DatasetContext';
import App from './App';

export default function Root() {
  return (
    <DatasetProvider>
      <App />
    </DatasetProvider>
  );
}
