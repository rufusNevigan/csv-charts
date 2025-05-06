import Papa from 'papaparse';
import {
  CsvParseError,
  CsvTooBigError,
  InvalidFileError,
  DuplicateHeadersError,
} from './errors';

export type {
  CsvParseError,
  CsvTooBigError,
  InvalidFileError,
  DuplicateHeadersError,
};

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseCsv(file: File, rowCap = 50000): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    // Check if file is a CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new InvalidFileError());
      return;
    }

    Papa.parse(file, {
      header: false, // Set to false to get raw data
      skipEmptyLines: true,
      complete: (results) => {
        // Handle empty file
        if (!results.data || results.data.length === 0) {
          resolve({ headers: [], rows: [] });
          return;
        }

        if (results.data.length > rowCap + 1) { // +1 for header row
          reject(new CsvTooBigError(rowCap));
          return;
        }

        // Get headers from first row
        const headers = (results.data[0] as string[]).map((h) => h.toString());

        // Check for duplicate headers
        const duplicateHeaders: string[] = [];
        headers.forEach((header, index) => {
          // For each header, if it appears at an earlier index, it's a duplicate
          if (headers.indexOf(header) !== index) {
            duplicateHeaders.push(header);
          }
        });

        if (duplicateHeaders.length > 0) {
          // For each duplicate header, add it twice to match the actual occurrences
          const duplicateMessage = duplicateHeaders.map((header) => [header, header]).flat();
          reject(new DuplicateHeadersError(duplicateMessage));
          return;
        }

        // Convert data to rows with header keys
        const rows = (results.data.slice(1) as string[][]).map((row) => {
          const rowObj: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index]?.toString() || '';
          });
          return rowObj;
        });

        resolve({ headers, rows });
      },
      error: () => {
        reject(new InvalidFileError());
      },
    });
  });
}
