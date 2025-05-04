import { ParsedCsv } from './parseCsv';

/**
 * Detects numeric columns in a CSV dataset by checking if all values in a column
 * can be converted to numbers. Returns the first two numeric columns found.
 * 
 * @param headers - Array of column headers
 * @param rows - Array of row data
 * @returns Object containing the first two numeric column keys, or undefined if not found
 */
export function detectNumericColumns(headers: string[], rows: Record<string, string>[]): { xKey?: string; yKey?: string } {
  if (!headers.length || !rows.length) {
    return {};
  }

  // Helper to check if a value is numeric
  const isNumeric = (value: string): boolean => {
    return !isNaN(Number(value)) && value.trim() !== '';
  };

  // Find all numeric columns
  const numericColumns = headers.filter(header => {
    // Check first 10 rows to determine if column is numeric
    const sampleRows = rows.slice(0, 10);
    return sampleRows.every(row => isNumeric(row[header]));
  });

  // Return first two numeric columns as x and y keys
  return {
    xKey: numericColumns[0],
    yKey: numericColumns[1],
  };
} 