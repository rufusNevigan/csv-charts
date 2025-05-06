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

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      data-testid="file-drop-zone"
      className={`file-picker ${isDragging ? 'bg-blue-50' : 'bg-slate-50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          document.getElementById('file-input')?.click();
        }
      }}
      aria-label="Upload CSV file"
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
