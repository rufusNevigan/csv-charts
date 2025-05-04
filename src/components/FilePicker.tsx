import React, { useCallback, useState, ChangeEvent } from 'react';

interface FilePickerProps {
  onFile: (file: File) => void;
  accept?: string;
}

export default function FilePicker({ onFile, accept = '.csv' }: FilePickerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file) {
      onFile(file);
    }
  }, [onFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      className={`file-picker ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-input"
        data-testid="file-input"
        aria-label="Upload CSV file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
      />
      <label htmlFor="file-input" className="file-picker-label">
        <span className="file-picker-text">
          Upload CSV file
        </span>
        <span className="file-picker-hint">CSV files only</span>
      </label>
    </div>
  );
}
