import Modal from './Modal';
import useDataset from '../contexts/useDataset';

export default function ErrorModal(): JSX.Element {
  const { state, dispatch } = useDataset();
  const { modalError } = state;

  const handleClose = () => {
    dispatch({ type: 'CLEAR_MODAL_ERROR' });
  };

  return (
    <Modal
      isOpen={!!modalError}
      onClose={handleClose}
      title="Error"
      data-testid="error-modal"
    >
      <div className="text-red-600" data-testid="error-modal-message">{modalError}</div>
    </Modal>
  );
}
