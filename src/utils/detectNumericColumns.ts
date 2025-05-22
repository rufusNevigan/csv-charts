/**
 * Detects which columns in a dataset contain only numeric values.
 * @param rows - Array of objects representing CSV rows
 * @param headers - Array of column header names
 * @returns Array of headers that contain only numeric values
 */
function detectNumericColumns(
  rows: Record<string, string>[],
  headers: string[],
): string[] {
  // Create a map to track which columns contain only numeric values
  const numericColumns = new Map<string, boolean>();
  headers.forEach((header) => numericColumns.set(header, true));

  // Check each row's values
  rows.forEach((row) => {
    headers.forEach((header) => {
      const value = row[header];
      // If already marked as non-numeric, skip
      if (!numericColumns.get(header)) return;

      // Check if value is numeric (empty strings are considered non-numeric)
      const isNumeric = value !== '' && !Number.isNaN(Number(value));
      if (!isNumeric) {
        numericColumns.set(header, false);
      }
    });
  });

  // Return headers that still have numeric flag set to true
  return headers.filter(
    (header) => numericColumns.get(header),
  );
}

export default detectNumericColumns;
