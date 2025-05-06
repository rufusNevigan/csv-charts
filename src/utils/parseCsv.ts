import Papa from 'papaparse';

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export class CsvTooBigError extends Error {
  constructor(rowCap: number) {
    super(`CSV file exceeds maximum row limit of ${rowCap}`);
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
    const duplicates = headers.map(header => header).join(', ');
    super(`Duplicate headers found: ${duplicates}`);
    this.name = 'DuplicateHeadersError';
  }
}

export async function parseCsv(file: File, rowCap = 50000): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    // Check if file is a CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      console.log('Rejecting non-CSV file:', file.name);
      reject(new InvalidFileError());
      return;
    }

    console.log('Starting to parse CSV file:', file.name);

    Papa.parse(file, {
      header: false, // Set to false to get raw data
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Papa Parse results:', {
          data: results.data,
          errors: results.errors,
          meta: results.meta,
        });

        if (results.data.length > rowCap + 1) { // +1 for header row
          console.log('Rejecting file due to row cap:', results.data.length);
          reject(new CsvTooBigError(rowCap));
          return;
        }

        // Get headers from first row
        const headers = (results.data[0] as string[]).map(h => h.toString());
        console.log('Parsed headers:', headers);

        // Check for duplicate headers
        const duplicateHeaders: string[] = [];
        headers.forEach((header, index) => {
          // For each header, if it appears at an earlier index, it's a duplicate
          if (headers.indexOf(header) !== index) {
            duplicateHeaders.push(header);
            console.log(`Found duplicate header "${header}" at index ${index}`);
          }
        });

        console.log('Found duplicate headers:', duplicateHeaders);
        console.log('Headers array:', headers);

        if (duplicateHeaders.length > 0) {
          // For each duplicate header, add it twice to match the actual occurrences
          const duplicateMessage = duplicateHeaders.map(header => `${header}, ${header}`).join(', ');
          console.log('Rejecting file due to duplicate headers:', duplicateMessage);
          const error = new DuplicateHeadersError(duplicateHeaders.map(header => [header, header]).flat());
          console.log('Created error object:', error);
          console.log('Error message:', error.message);
          reject(error);
          return;
        }

        // Convert data to rows with header keys
        const rows = (results.data.slice(1) as string[][]).map(row => {
          const rowObj: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index]?.toString() || '';
          });
          return rowObj;
        });

        resolve({ headers, rows });
      },
      error: (error) => {
        console.log('Papa Parse error:', error);
        reject(new InvalidFileError());
      },
    });
  });
}
