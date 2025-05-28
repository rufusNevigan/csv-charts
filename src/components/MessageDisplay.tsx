import useDataset from '../contexts/useDataset';

export default function MessageDisplay(): JSX.Element | null {
  const { state } = useDataset();
  const { modalError } = state;

  if (!modalError) return null;

  return (
    <div
      className="fixed inset-x-0 top-4 flex justify-center"
      data-testid="message-display"
    >
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{modalError}</span>
      </div>
    </div>
  );
}
