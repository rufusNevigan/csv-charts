import React, { useCallback, useState } from 'react';

interface FilePickerProps {
  onFile: (file: File) => void;
  accept: string;
}

function FilePicker({ onFile, accept = '.csv' }: FilePickerProps) {
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

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
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <label htmlFor="file-input" className="file-picker-label">
        <span className="file-picker-text">
          {isDragging ? 'Drop your CSV file here' : 'Click to upload or drag and drop'}
        </span>
        <span className="file-picker-hint">CSV files only</span>
      </label>
    </div>
  );
}

export default FilePicker;
