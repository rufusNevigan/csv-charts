import Modal from './Modal';
import useDataset from '../contexts/useDataset';

export default function WarningModal(): JSX.Element {
  const { state, dispatch } = useDataset();
  const { modalWarning } = state;

  const handleClose = () => {
    dispatch({ type: 'CLEAR_MODAL_WARNING' });
  };

  return (
    <Modal
      isOpen={!!modalWarning}
      onClose={handleClose}
      title="Warning"
      data-testid="warning-modal"
    >
      <div className="text-yellow-600" data-testid="warning-modal-message">{modalWarning}</div>
    </Modal>
  );
}
