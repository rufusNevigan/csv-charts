import { useDataset } from './contexts/DatasetContext';
import FilePicker from './components/FilePicker';
import { ChartCanvas } from './components/ChartCanvas';
import { ColumnSelector } from './components/ColumnSelector';
import './App.css';
import './components/FilePicker.css';

export default function App() {
  const { dispatch } = useDataset();

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <h1 className="text-3xl font-semibold text-center mb-8">CSV Charts</h1>
      <div className="max-w-4xl mx-auto">
        <FilePicker onFile={(file) => dispatch({ type: 'SET_FILE', payload: file })} />
        <ColumnSelector />
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg min-h-[500px] relative">
          <ChartCanvas />
        </div>
      </div>
    </main>
  );
}
