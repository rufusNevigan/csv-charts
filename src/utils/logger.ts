type LogLevel = 'info' | 'error';

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === 'error') {
    console.error(prefix, message, ...args);
  } else {
    console.log(prefix, message, ...args);
  }
}

export const info = (message: string, ...args: unknown[]): void => {
  log('info', message, ...args);
};

export const error = (message: string, ...args: unknown[]): void => {
  log('error', message, ...args);
};
