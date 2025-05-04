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

export async function parseCsv(file: File, rowCap = 50000): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > rowCap) {
          reject(new CsvTooBigError(rowCap));
          return;
        }

        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];

        resolve({ headers, rows });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
