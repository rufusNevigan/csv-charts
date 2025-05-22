interface WarningMessageProps {
  message: string;
}

function WarningMessage({ message }: WarningMessageProps): JSX.Element | null {
  if (!message) return null;

  return (
    <div
      className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mt-4"
      role="alert"
      data-testid="warning-message"
    >
      <strong className="font-bold">Warning: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
}

export default WarningMessage;
