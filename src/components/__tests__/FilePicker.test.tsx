import {
  describe, it, expect, vi,
} from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import FilePicker from '../FilePicker';

describe('FilePicker', () => {
  it('fires onFile callback when file is selected via input', () => {
    const mockOnFile = vi.fn();
    render(<FilePicker onFile={mockOnFile} accept=".csv" />);

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnFile).toHaveBeenCalledTimes(1);
    expect(mockOnFile).toHaveBeenCalledWith(file);
  });

  it('fires onFile callback when file is dropped', () => {
    const mockOnFile = vi.fn();
    render(<FilePicker onFile={mockOnFile} accept=".csv" />);

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const dropZone = screen.getByTestId('file-drop-zone');

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockOnFile).toHaveBeenCalledTimes(1);
    expect(mockOnFile).toHaveBeenCalledWith(file);
  });

  it('does not fire onFile callback when no file is selected', () => {
    const mockOnFile = vi.fn();
    render(<FilePicker onFile={mockOnFile} accept=".csv" />);

    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [] } });

    expect(mockOnFile).not.toHaveBeenCalled();
  });

  it('does not fire onFile callback when no file is dropped', () => {
    const mockOnFile = vi.fn();
    render(<FilePicker onFile={mockOnFile} accept=".csv" />);

    const dropZone = screen.getByTestId('file-drop-zone');

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [],
      },
    });

    expect(mockOnFile).not.toHaveBeenCalled();
  });

  it('shows dragging state when file is dragged over', () => {
    render(<FilePicker onFile={vi.fn()} />);

    const dropZone = screen.getByTestId('file-drop-zone');
    fireEvent.dragOver(dropZone);

    expect(dropZone).toHaveClass('bg-blue-50');
  });

  it('hides dragging state when file is dragged out', () => {
    render(<FilePicker onFile={vi.fn()} />);

    const dropZone = screen.getByTestId('file-drop-zone');
    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);

    expect(dropZone).toHaveClass('bg-slate-50');
  });
});
