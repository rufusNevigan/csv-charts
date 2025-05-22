interface LoadingOverlayProps {
  show: boolean;
}

function LoadingOverlay({ show }: LoadingOverlayProps): JSX.Element | null {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="loading-overlay"
    >
      <div className="bg-white rounded-lg p-8 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <p className="mt-4 text-gray-700">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
