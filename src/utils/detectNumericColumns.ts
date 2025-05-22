/**
 * Detects which columns in a dataset contain only numeric values.
 * Empty values are not allowed - a column must have all values be numeric
 * to be considered a numeric column.
 * @param rows - Array of objects representing CSV rows
 * @param headers - Array of column header names
 * @returns Array of headers that contain only numeric values
 */
function detectNumericColumns(
  rows: Record<string, string>[],
  headers: string[],
): string[] {
  // Track columns that are numeric
  const numericColumns = new Map<string, boolean>();
  headers.forEach((header) => numericColumns.set(header, true));

  // Check each row's values
  rows.forEach((row) => {
    headers.forEach((header) => {
      const value = row[header];
      // If already marked as non-numeric, skip
      if (!numericColumns.get(header)) return;

      // Empty values disqualify a column from being numeric
      if (value === '') {
        numericColumns.set(header, false);
        return;
      }

      // Check if value is numeric
      const isNumeric = !Number.isNaN(Number(value));
      if (!isNumeric) {
        numericColumns.set(header, false);
      }
    });
  });

  // Return headers that are numeric
  return headers.filter(
    (header) => numericColumns.get(header),
  );
}

export default detectNumericColumns;
