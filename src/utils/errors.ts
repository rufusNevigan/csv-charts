/* eslint-disable max-classes-per-file */
// Base error class for CSV parsing errors
export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvParseError';
  }
}

// Specific error types extending base error
export class CsvTooBigError extends Error {
  constructor(rowCap: number) {
    super(
      `This file contains more than ${rowCap.toLocaleString()} rows. For performance reasons, please use a smaller dataset or filter your data before uploading.`,
    );
    this.name = 'CsvTooBigError';
  }
}

export class InvalidFileError extends Error {
  constructor() {
    super('Failed to parse CSV file');
    this.name = 'InvalidFileError';
  }
}

export class DuplicateHeadersError extends Error {
  constructor(headers: string[]) {
    const duplicates = headers.join(', ');
    super(`Duplicate headers found: ${duplicates}`);
    this.name = 'DuplicateHeadersError';
  }
}
