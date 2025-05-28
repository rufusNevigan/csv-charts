/**
 * Detects which columns in a dataset contain only numeric values.
 * Empty values are allowed - a column is considered numeric if all
 * non-empty values are numeric.
 * @param rows - Array of objects representing CSV rows
 * @param headers - Array of column header names
 * @returns Array of headers that contain only numeric values
 */
function detectNumericColumns(
  rows: Record<string, string>[],
  headers: string[],
): string[] {
  // Track columns that are numeric and have at least one non-empty value
  const numericColumns = new Map<string, boolean>();
  const hasNonEmptyValue = new Map<string, boolean>();
  headers.forEach((header) => {
    numericColumns.set(header, true);
    hasNonEmptyValue.set(header, false);
  });

  // Check each row's values
  rows.forEach((row) => {
    headers.forEach((header) => {
      const value = row[header];
      // If already marked as non-numeric, skip
      if (!numericColumns.get(header)) return;

      // Skip empty values
      if (value === undefined || value === null || value === '') return;

      // Mark as having a non-empty value
      hasNonEmptyValue.set(header, true);

      // Check if value is numeric
      const num = Number(value);
      const isNumeric = !Number.isNaN(num) && typeof num === 'number' && value.trim() !== '';
      if (!isNumeric) {
        numericColumns.set(header, false);
      }
    });
  });

  // Return headers that are numeric and have at least one non-empty value
  return headers.filter(
    (header) => numericColumns.get(header) && hasNonEmptyValue.get(header),
  );
}

export default detectNumericColumns;
