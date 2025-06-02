import './App.css';
import FilePicker from './components/FilePicker';
import ChartCanvas from './components/ChartCanvas';
import ColumnSelector from './components/ColumnSelector';
import FilterBuilder from './components/FilterBuilder';
import DatasetProvider from './contexts/DatasetContext';
import useDataset from './contexts/useDataset';
import AppErrorBoundary from './components/AppErrorBoundary';
import LoadingOverlay from './components/LoadingOverlay';
import ResetButton from './components/ResetButton';
import ErrorMessage from './components/ErrorMessage';
import WarningMessage from './components/WarningMessage';
import ErrorModal from './components/ErrorModal';
import WarningModal from './components/WarningModal';

function AppContent(): JSX.Element {
  const { state } = useDataset();
  const {
    loading, error, warning, data,
  } = state;

  return (
    <>
      <LoadingOverlay show={loading} />
      <ResetButton />
      <ErrorModal />
      <WarningModal />
      <main className="h-screen flex flex-col items-center justify-start bg-slate-100 p-8">
        <h1 className="text-3xl font-semibold mb-8">CSV Charts</h1>
        <FilePicker />
        {error && <ErrorMessage message={error} />}
        {warning && <WarningMessage message={warning} />}
        <ColumnSelector />
        {data.length > 0 && <FilterBuilder />}
        <ChartCanvas />
      </main>
    </>
  );
}

function App(): JSX.Element {
  return (
    <AppErrorBoundary>
      <DatasetProvider>
        <AppContent />
      </DatasetProvider>
    </AppErrorBoundary>
  );
}

export default App;
