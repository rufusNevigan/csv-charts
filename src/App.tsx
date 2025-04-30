import { useState } from 'react';
import FilePicker from './components/FilePicker';
import { parseCsv } from './utils/parseCsv';
import './App.css';
import './components/FilePicker.css';

function App() {
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    try {
      setError(null);
      await parseCsv(file);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div className="app">
      <h1>CSV Charts</h1>
      <FilePicker onFile={handleFile} accept=".csv" />
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;
