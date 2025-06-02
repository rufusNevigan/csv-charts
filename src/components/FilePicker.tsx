import React, { useCallback, useState } from 'react';
import useDataset from '../contexts/useDataset';
import './FilePicker.css';

interface FilePickerProps {
  onFile?: (file: File) => void;
}

function FilePicker({ onFile }: FilePickerProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const { dispatch } = useDataset();

  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to parse CSV file',
      });
      return false;
    }
    return true;
  }, [dispatch]);

  const handleFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) {
        return;
      }

      if (onFile) {
        onFile(file);
      } else {
        dispatch({ type: 'SET_FILE', payload: file });
      }
    },
    [onFile, dispatch, validateFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  return (
    <div
      className={`file-picker ${isDragging ? 'bg-blue-50' : 'bg-slate-50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="file-drop-zone"
    >
      <label className="file-picker-label" htmlFor="csv-file">
        <span className="file-picker-text">Select CSV file</span>
        <span className="file-picker-hint">or drag and drop here</span>
        <input
          type="file"
          id="csv-file"
          accept=".csv"
          onChange={handleChange}
          aria-label="Select CSV file"
        />
      </label>
    </div>
  );
}

export default FilePicker;
