import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import Modal from '../Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Test content</div>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal content when isOpen is true', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Test Modal">
        <div>Test content</div>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <div>Test content</div>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId('modal-close-button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the overlay', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <div>Test content</div>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking the modal content', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <div data-testid="modal-content">Test content</div>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId('modal-content'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
