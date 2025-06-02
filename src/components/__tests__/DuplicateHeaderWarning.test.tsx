import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { vi } from 'vitest';
import App from '../../App';

// Mock Papa Parse to return duplicate headers
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((file, options) => {
      // Simulate duplicate headers CSV
      const mockData = [
        ['Name', 'Age', 'Name'], // Duplicate 'Name' header
        ['John', '25', 'Doe'],
        ['Jane', '30', 'Smith'],
      ];

      setTimeout(() => {
        options.complete({
          data: mockData,
        });
      }, 0);
    }),
  },
}));

describe('Duplicate Header Warning', () => {
  it('shows warning modal when CSV has duplicate headers', async () => {
    render(<App />);

    // Create a mock file with duplicate headers
    const file = new File(['Name,Age,Name\nJohn,25,Doe\nJane,30,Smith'], 'test.csv', {
      type: 'text/csv',
    });

    // Find file input and upload file
    const fileInput = screen.getByLabelText(/select csv file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for warning modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('warning-modal')).toBeInTheDocument();
    });

    // Check warning message content
    expect(screen.getByTestId('warning-modal-message')).toHaveTextContent(
      'Duplicate headers found: Name',
    );

    // Check that it's a warning modal, not an error modal
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('allows closing the warning modal', async () => {
    render(<App />);

    const file = new File(['Name,Age,Name\nJohn,25,Doe'], 'test.csv', {
      type: 'text/csv',
    });

    const fileInput = screen.getByLabelText(/select csv file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('warning-modal')).toBeInTheDocument();
    });

    // Close the modal
    fireEvent.click(screen.getByTestId('modal-close-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('warning-modal')).not.toBeInTheDocument();
    });
  });
});
