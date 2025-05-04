interface NumericColumns {
  xKey?: string;
  yKey?: string;
}

/**
 * Detects the first two numeric columns in a dataset.
 * Returns undefined for xKey/yKey if no numeric columns are found.
 */
function detectNumericColumns(
  headers: string[],
  rows: Record<string, string>[],
): NumericColumns {
  if (!headers?.length || !rows?.length) {
    return {};
  }

  const isNumeric = (value: string) => {
    const num = Number(value);
    return !Number.isNaN(num) && typeof num === 'number';
  };

  // Check first 10 rows to determine if a column is numeric
  const sampleRows = rows.slice(0, 10);
  const numericColumns = headers.filter((header) => (
    sampleRows.every((row) => isNumeric(row[header]))
  ));

  const [xKey, yKey] = numericColumns;
  return { xKey, yKey };
}

export default detectNumericColumns;
